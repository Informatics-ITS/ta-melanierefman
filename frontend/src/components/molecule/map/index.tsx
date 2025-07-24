import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Typography } from '../../atom/typography';
import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useTranslation } from 'react-i18next';

interface ResearchItem {
  id: number;
  judul: string;
  title: string;
  deskripsi: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string | null;
}

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Mapping = ({ data }: { data: ResearchItem[] }) => {
  const getLocalizedRoute = useLocalizedRoute();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <MapContainer
      center={[-4.5, 120]}
      zoom={5}
      className="lg:h-[500px] md:h-[400px] h-[300px] w-full z-0 rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.length > 0 && data.map((item) => {
        const formattedTitle = (lang === 'id' ? item.judul : item.title)
          .toLowerCase()
          .replace(/\s+/g, '+');

        const linkTo = getLocalizedRoute('detail_penelitian', {
          title: formattedTitle,
        });

        return (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={redIcon}
          >
            <Popup>
              <div className="bg-white w-[200px] space-y-1">
                <Link to={linkTo}>
                  <Typography type="caption1" weight="semibold" className="text-typo line-clamp-3 hover:underline hover:text-primary">
                    {lang === 'id' ? item.judul : item.title}
                  </Typography>
                </Link>
                <Typography type="caption2" font="dm-sans" className="text-typo-secondary">{item.date}</Typography>
                <Typography type="caption2" font="dm-sans" className="line-clamp-6">{lang === 'id' ? item.deskripsi : item.description}</Typography>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Mapping;