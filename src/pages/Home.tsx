
import MapView from '../components/Map/MapView';
import { useAppStore } from '../store/appStore';

export default function Home() {
  const { currentRole } = useAppStore();

  return (
    <div className="w-full h-full relative">
      <MapView />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2 shadow-card pointer-events-auto">
          <h1 className="text-xs font-medium text-smoke-700 px-1">
            {currentRole === 'citizen' && '城市公共吸烟区与烟蒂收集点地图'}
            {currentRole === 'cleaner' && '保洁作业导航地图'}
            {currentRole === 'admin' && '设施监控地图'}
          </h1>
        </div>
      </div>
    </div>
  );
}
