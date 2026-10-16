import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  ShieldCheck,
  Clock,
  Gauge,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  ChevronDown,
  ChevronUp,
  Share2,
  Store,
  Home,
  Check,
} from 'lucide-react';
import { Order, Captain } from '../../types';
import {
  calculateDistanceKm,
  estimateRemainingEtaMinutes,
  generateRoutePoints,
  interpolateCoordinate,
} from '../../utils/mshwarLogic';
import { useMshwar } from '../../context/MshwarContext';

interface OrderLiveTrackingMapProps {
  order: Order;
  captain?: Captain | null;
  compact?: boolean;
}

type TileStyle = 'voyager' | 'osm' | 'dark';

export const OrderLiveTrackingMap: React.FC<OrderLiveTrackingMapProps> = ({
  order,
  captain,
  compact = false,
}) => {
  const { updateOrderStatus, showToast } = useMshwar();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const captainMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const remainingPolylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Simulation & tracking state
  const [isPlaying, setIsPlaying] = useState<boolean>(order.status === 'on_the_way');
  const [simProgress, setSimProgress] = useState<number>(() => {
    if (order.status === 'placed' || order.status === 'bidding_open' || order.status === 'confirmed') return 0;
    if (order.status === 'preparing') return 0.05;
    if (order.status === 'ready_for_pickup') return 0.15;
    if (order.status === 'on_the_way') return 0.55;
    if (order.status === 'delivered') return 1;
    return 0.35;
  });
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [tileStyle, setTileStyle] = useState<TileStyle>('osm');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [autoFollowCaptain, setAutoFollowCaptain] = useState<boolean>(true);

  // Coordinates resolution
  const pickupCoord: [number, number] = useMemo(() => {
    return [order.pickupLat || 31.5042, order.pickupLng || 34.4648];
  }, [order.pickupLat, order.pickupLng]);

  const dropoffCoord: [number, number] = useMemo(() => {
    return [order.dropoffLat || 31.4965, order.dropoffLng || 34.453];
  }, [order.dropoffLat, order.dropoffLng]);

  // Generate realistic route waypoints
  const fullRoutePoints = useMemo(() => {
    return generateRoutePoints(pickupCoord, dropoffCoord);
  }, [pickupCoord, dropoffCoord]);

  // Current interpolated captain position based on progress
  const currentCaptainCoord = useMemo<[number, number]>(() => {
    const totalSegments = fullRoutePoints.length - 1;
    const scaledProgress = simProgress * totalSegments;
    const currentSegmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentProgress = scaledProgress - currentSegmentIndex;
    const startPt = fullRoutePoints[currentSegmentIndex];
    const endPt = fullRoutePoints[currentSegmentIndex + 1];
    return interpolateCoordinate(
      startPt[0],
      startPt[1],
      endPt[0],
      endPt[1],
      segmentProgress
    );
  }, [simProgress, fullRoutePoints]);

  // Distance metrics
  const totalDistanceKm = useMemo(() => {
    return calculateDistanceKm(pickupCoord[0], pickupCoord[1], dropoffCoord[0], dropoffCoord[1]);
  }, [pickupCoord, dropoffCoord]);

  const remainingDistanceKm = useMemo(() => {
    return calculateDistanceKm(
      currentCaptainCoord[0],
      currentCaptainCoord[1],
      dropoffCoord[0],
      dropoffCoord[1]
    );
  }, [currentCaptainCoord, dropoffCoord]);

  const currentSpeedKmh = useMemo(() => {
    if (order.status === 'delivered') return 0;
    if (order.status === 'preparing' || order.status === 'bidding_open') return 0;
    if (!isPlaying) return 0;
    return Math.round((24 + (simProgress * 10) % 9) * 10) / 10;
  }, [isPlaying, simProgress, order.status]);

  const remainingEtaMinutes = useMemo(() => {
    if (order.status === 'delivered') return 0;
    return estimateRemainingEtaMinutes(remainingDistanceKm, currentSpeedKmh || 25);
  }, [remainingDistanceKm, currentSpeedKmh, order.status]);

  // Maneuver instruction based on progress
  const currentManeuver = useMemo(() => {
    if (order.status === 'delivered' || simProgress >= 0.98) {
      return 'وصل الكابتن إلى موقعك بدقة! بالهناء والشفاء.';
    }
    if (order.status === 'preparing' || simProgress < 0.1) {
      return 'الكابتن بانتظار استلام الوجبة الساخنة من المطعم.';
    }
    if (simProgress < 0.35) {
      return 'الانعطاف يميناً بعد 180 متراً نحو شارع عمر المختار';
    }
    if (simProgress < 0.7) {
      return 'الاستمرار مباشرة لمسافة 450 متراً بمحاذاة الشارع الرئيسي';
    }
    return 'الاقتراب من نقطة التوصيل على بُعد 200 متر';
  }, [order.status, simProgress]);

  // Tile layers definition
  const getTileUrl = (style: TileStyle) => {
    switch (style) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';
      case 'voyager':
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Setup Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentCaptainCoord,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      const tiles = L.tileLayer(getTileUrl(tileStyle), {
        maxZoom: 19,
        subdomains: 'abc',
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Restaurant Marker
      const restaurantIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-12 h-12 bg-amber-500/20 rounded-full animate-ping"></span>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-amber-400/40">
              <span class="text-lg">🍔</span>
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
              ${order.restaurantNameAr}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const restMarker = L.marker(pickupCoord, { icon: restaurantIcon }).addTo(map);
      restaurantMarkerRef.current = restMarker;

      // Customer Destination Marker
      const customerIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-emerald-400/40">
              <span class="text-lg">📍</span>
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
              موقع التسليم
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const custMarker = L.marker(dropoffCoord, { icon: customerIcon }).addTo(map);
      destinationMarkerRef.current = custMarker;

      // Moving Captain Marker
      const capName = order.captainName || captain?.name || 'كابتن مشوار';
      const captainIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-14 h-14 bg-emerald-500/25 rounded-full animate-ping"></span>
            <span class="absolute w-10 h-10 bg-emerald-500/40 rounded-full animate-pulse"></span>
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 text-white shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-emerald-300/60 z-10">
              <span class="text-xl">🛵</span>
            </div>
            <div class="absolute -top-7 bg-emerald-950 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-emerald-400/40 flex items-center gap-1 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${capName}</span>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      const capMarker = L.marker(currentCaptainCoord, { icon: captainIcon, zIndexOffset: 1000 }).addTo(map);
      captainMarkerRef.current = capMarker;

      // Polylines: completed & remaining
      const completedPts = fullRoutePoints.slice(0, 1);
      completedPolylineRef.current = L.polyline(completedPts, {
        color: '#059669',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      remainingPolylineRef.current = L.polyline(fullRoutePoints, {
        color: '#10b981',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const bounds = L.latLngBounds([pickupCoord, dropoffCoord]);
      map.fitBounds(bounds, { padding: [40, 40] });
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile style when switched
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(tileStyle));
  }, [tileStyle]);

  // Handle map resize on expand/collapse
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
    }
  }, [isExpanded, compact]);

  // Live simulation tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        const step = 0.008 * simSpeed;
        const next = prev + step;
        if (next >= 1) {
          setIsPlaying(false);
          if (order.status === 'on_the_way') {
            updateOrderStatus(order.id, 'delivered');
          }
          return 1;
        }
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, order.status, order.id, updateOrderStatus]);

  // Update captain marker position and polylines on coordinate change
  useEffect(() => {
    if (!mapInstanceRef.current || !captainMarkerRef.current) return;

    captainMarkerRef.current.setLatLng(currentCaptainCoord);
    if (autoFollowCaptain && isPlaying) {
      mapInstanceRef.current.panTo(currentCaptainCoord, { animate: true, duration: 0.4 });
    }

    const totalSegments = fullRoutePoints.length - 1;
    const currentSegmentIndex = Math.min(
      Math.floor(simProgress * totalSegments),
      totalSegments - 1
    );

    const completedPath: [number, number][] = [
      ...fullRoutePoints.slice(0, currentSegmentIndex + 1),
      currentCaptainCoord,
    ];
    const remainingPath: [number, number][] = [
      currentCaptainCoord,
      ...fullRoutePoints.slice(currentSegmentIndex + 1),
    ];

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedPath);
    }
    if (remainingPolylineRef.current) {
      remainingPolylineRef.current.setLatLngs(remainingPath);
    }
  }, [currentCaptainCoord, fullRoutePoints, simProgress, autoFollowCaptain, isPlaying]);

  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([pickupCoord, dropoffCoord, currentCaptainCoord]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  const handleCenterCaptain = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(currentCaptainCoord, 16, { animate: true });
    setAutoFollowCaptain(true);
  };

  const handleResetSimulation = () => {
    setSimProgress(0);
    setIsPlaying(true);
    if (order.status === 'delivered') {
      updateOrderStatus(order.id, 'on_the_way');
    }
  };

  const handleShareTrackingLink = () => {
    const link = `https://mshwar.ps/track/${order.orderNumber}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    showToast('تم نسخ رابط التتبع الحي للطلب بنجاح');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const captainDisplayName = order.captainName || captain?.name || 'أحمد الكردي';
  const captainPhone = order.captainPhone || captain?.phone || '0599123456';
  const captainVehicle = order.captainVehicle || captain?.vehicle || 'دراجة سكوتر مشوار (#102)';

  const steps = [
    { id: 'placed', label: 'تم الطلب' },
    { id: 'confirmed', label: 'تم التأكيد' },
    { id: 'preparing', label: 'قيد التحضير' },
    { id: 'ready_for_pickup', label: 'جاهز للاستلام' },
    { id: 'on_the_way', label: 'في الطريق' },
    { id: 'delivered', label: 'تم التسليم' },
  ];

  const getStepActiveIndex = (status: Order['status']) => {
    switch (status) {
      case 'placed':
      case 'bidding_open':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'on_the_way':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepActiveIndex(order.status);

  return (
    <div
      className={`relative w-full rounded-3xl bg-slate-900 border border-slate-700/60 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : compact ? 'min-h-[460px]' : 'min-h-[560px]'
      }`}
    >
      {/* Top Floating Header & Status Bar */}
      <div className="relative z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 sm:p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  رادار التتبع الحي المباشر: #{order.orderNumber}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>GPS متصل ومباشر</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                من: {order.restaurantNameAr} • إلى: {order.customerAddress.split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'تصغير الخريطة' : 'ملء الشاشة'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareTrackingLink}
              className="px-3 py-1.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-600/40"
              title="مشاركة رابط التتبع الحي"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم النسخ!' : 'مشاركة الرابط'}</span>
            </button>
          </div>
        </div>

        {/* 5-Step Order Progress Horizontal Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="grid grid-cols-5 gap-1 text-center">
            {steps.slice(1).map((s, idx) => {
              const stepIndex = idx + 1;
              const isPassed = currentStepIndex >= stepIndex;
              const isCurrent = currentStepIndex === stepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    updateOrderStatus(order.id, s.id as Order['status']);
                    if (s.id === 'on_the_way') {
                      setIsPlaying(true);
                      setSimProgress(0.45);
                    } else if (s.id === 'delivered') {
                      setSimProgress(1);
                      setIsPlaying(false);
                    }
                  }}
                  className={`flex flex-col items-center p-1 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500/20 border border-emerald-500/40 ring-1 ring-emerald-400/40 text-emerald-300 font-bold'
                      : isPassed
                      ? 'text-slate-300 hover:bg-slate-800/60'
                      : 'text-slate-500 hover:bg-slate-800/40 opacity-70'
                  }`}
                  title={`تحديث الحالة: ${s.label}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                        : isPassed
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? '✓' : stepIndex}
                  </div>
                  <span className="text-[10px] truncate max-w-full font-medium">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 min-h-[300px] w-full bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Floating Maneuver Turn-by-Turn Card */}
        <div className="absolute top-3 right-3 left-3 sm:right-3 sm:left-auto sm:max-w-md z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 text-white shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              توجيه الملاحة الحي
            </span>
            <p className="text-xs font-bold text-slate-100 truncate sm:whitespace-normal">
              {currentManeuver}
            </p>
          </div>
        </div>

        {/* Floating Map Controls on Top Left */}
        <div className="absolute top-16 left-3 z-20 flex flex-col gap-2">
          <button
            onClick={handleCenterCaptain}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-slate-700 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="توسيط موقع الكابتن"
          >
            <Bike className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitRoute}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="إظهار كامل المسار"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTileStyle((prev) => (prev === 'voyager' ? 'dark' : prev === 'dark' ? 'osm' : 'voyager'));
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title={`تغيير نمط الخريطة (${tileStyle})`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Live Telemetry Overlay */}
        <div className="absolute bottom-3 inset-x-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 text-white shadow-xl">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>الوصول المتوقع</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300 block mt-0.5">
                {order.status === 'delivered' ? 'وصلت' : `${remainingEtaMinutes} دقيقة`}
              </span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>المسافة المتبقية</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 block mt-0.5">
                {order.status === 'delivered' ? '0 كم' : `${remainingDistanceKm.toFixed(1)} كم`}
              </span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span>سرعة الدراجة</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-cyan-300 block mt-0.5">
                {currentSpeedKmh} كم/س
              </span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>دقة GPS</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 block mt-0.5">
                عالية (98%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Controls & Scrubber */}
      <div className="relative z-20 bg-slate-900 border-t border-slate-800 p-3 sm:p-4 text-white space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-400" />
              <span>{order.restaurantNameAr} (0 كم)</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {Math.round(simProgress * 100)}% من الرحلة
            </span>
            <span className="flex items-center gap-1">
              <Home className="w-3 h-3 text-emerald-400" />
              <span>وجهة التسليم ({totalDistanceKm.toFixed(1)} كم)</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={simProgress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSimProgress(val);
                if (val >= 1) {
                  updateOrderStatus(order.id, 'delivered');
                  setIsPlaying(false);
                } else if (val >= 0.2 && order.status !== 'on_the_way') {
                  updateOrderStatus(order.id, 'on_the_way');
                }
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Simulation Playback Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل المحاكاة'}</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="إعادة بدء الرحلة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/60 text-[11px]">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Captain Verification Card */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-2xl">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              {captainDisplayName.slice(0, 2)}
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white block">{captainDisplayName}</span>
              <span className="text-[10px] text-slate-400 block">{captainVehicle}</span>
            </div>
            <a
              href={`tel:${captainPhone}`}
              className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors mr-1 cursor-pointer"
              title="اتصال بالكابتن"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Order Details Accordion Drawer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white py-1 transition-colors cursor-pointer"
          >
            <span className="font-bold flex items-center gap-1.5">
              <span>تفاصيل الوجبات ({order.items.length} أصناف)</span>
              <span className="text-emerald-400 font-black">• الإجمالي: {order.total} ₪</span>
            </span>
            {showOrderDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showOrderDetails && (
            <div className="mt-2 p-3 bg-slate-800/70 border border-slate-700/50 rounded-2xl space-y-2 text-xs">
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div
                    key={`order-track-item-${idx}`}
                    className="flex items-center justify-between text-slate-200 pb-1 border-b border-slate-700/40 text-[11px]"
                  >
                    <span>
                      {item.foodItem.nameAr} × {item.quantity}
                    </span>
                    <span className="font-bold">{item.foodItem.price * item.quantity} ₪</span>
                  </div>
                ))}
              </div>
              <div className="pt-1 flex items-center justify-between text-slate-300 text-[11px]">
                <span>أجرة التوصيل:</span>
                <span className="font-bold text-emerald-400">{order.deliveryFee} ₪</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>طريقة الدفع:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'cash' ? 'الدفع نقداً عند الاستلام' : 'دفع إلكتروني / تحويل'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
