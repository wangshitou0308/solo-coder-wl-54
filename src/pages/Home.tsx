
import MapView from '../components/Map/MapView';
import { useAppStore } from '../store/appStore';

export default function Home() {
  const { currentRole } = useAppStore();

  return (
    <div className="w-full h-full relative">
      <MapView />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-2 shadow-card">
          <h1 className="text-sm font-medium text-smoke-700 px-2">
            {currentRole === 'citizen' && '城市公共吸烟区与烟蒂收集点地图'}
            {currentRole === 'cleaner' && '保洁作业导航地图'}
            {currentRole === 'admin' && '设施监控地图'}
          </h1>
        </div>
      </div>
    </div>
  );
}
