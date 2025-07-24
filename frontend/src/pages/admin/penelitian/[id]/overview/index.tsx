import { Typography } from '../../../../../components/atom/typography';
import Carousel from '../../../../../components/molecule/card/image/carousel';
import Card from '../../../../../components/molecule/card/card-info';
import SingleImage from '../../../../../components/molecule/card/image/single';

import { PenelitianProps } from "../../../../../entities/penelitian";

const Overview: React.FC<{ currentPenelitian: PenelitianProps }> = ({ currentPenelitian }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const images = currentPenelitian.documentations || [];

  const formatDateMY = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const filteredImages = Array.isArray(images)
  ? images.filter(doc => doc.image && doc.pivot?.is_thumbnail === 1)
  : [];

  const infoContent = Object.fromEntries(
    Object.entries({
      Durasi: currentPenelitian.start_date && currentPenelitian.end_date
        ? `${formatDateMY(currentPenelitian.start_date)} - ${formatDateMY(currentPenelitian.end_date)}`
        : undefined,
      Koordinator: currentPenelitian.members.find(member => member.pivot.is_coor)?.name || "",
      Anggota: currentPenelitian.members
        .filter(member => !member.pivot.is_coor)
        .map(member => member.name || "")
        .join(', '),
      Kolaborator: currentPenelitian.partners
        .flatMap(partner =>
          (partner.partners_member?.length
            ? partner.partners_member.map(member => `${member.name} (${partner.name})`)
            : [`(${partner.name})`])
        )
        .join(', ')
    }).filter(([_, value]) => String(value ?? '').trim() !== '')
  );
  
  const contactContent = Object.fromEntries(
    Object.entries({
      Telepon: currentPenelitian.members.find(member => member.pivot.is_coor)?.phone,
      Email: currentPenelitian.members.find(member => member.pivot.is_coor)?.email,
    }).filter(([_, value]) => String(value ?? '').trim() !== '')
  );  

  return (
    <div className="md:flex md:space-x-6 space-y-4 md:space-y-0">
      <div className="md:w-2/3 space-y-4">
        {filteredImages.length === 1 ? (
          <SingleImage
            image={{
              imageUrl: `${baseUrl}/storage/${filteredImages[0].image}`,
              caption: filteredImages[0].caption,
              keterangan: filteredImages[0].keterangan,
            }}
            className="md:aspect-[16/9] aspect-[4/3]"
            variant="rounded"
          />
          ) : (
            <Carousel
              images={filteredImages}
              baseUrl={baseUrl}
              className="md:aspect-[16/9] aspect-[4/3]"
            />
          )}
        <div>
          <Typography type="body" weight="semibold">
            Deskripsi (Bahasa Indonesia)
          </Typography>
          <Typography type="body" font="dm-sans" className="text-typo text-justify">
            {currentPenelitian?.deskripsi}
          </Typography>
        </div>
        <div>
          <Typography type="body" weight="semibold">
            Description (English)
          </Typography>
          <Typography type="body" font="dm-sans" className="text-typo text-justify">
            {currentPenelitian?.description}
          </Typography>
        </div>
        {currentPenelitian.latitude && currentPenelitian.longitude && currentPenelitian.zoom && (
          <div>
            <Typography type="body" weight="semibold">
              Lokasi Penelitian
            </Typography>
            <div className="w-full md:aspect-[16/9] aspect-[4/3] rounded-xl overflow-hidden border mt-2">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=${currentPenelitian.latitude || '-6.20876'},${currentPenelitian.longitude || '106.84513'}&zoom=${currentPenelitian.zoom || 12}`}
                loading="lazy"
                style={{ border: 0 }}
                allowFullScreen
              ></iframe>
            </div> 
          </div>
        )}
      </div>
      <div className="md:w-1/3">
        {Object.keys(infoContent).length > 0 && (
          <Card title="Informasi Penelitian" content={infoContent} />
        )}

        {Object.keys(contactContent).length > 0 && (
          <Card title="Informasi Kontak Koordinator" content={contactContent} />
        )}
      </div>
    </div>
  );
};

export default Overview;  