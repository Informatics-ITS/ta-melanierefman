import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Typography } from "../../../components/atom/typography";
import Loading from "../../../components/atom/loading";
import Image from "../../../components/molecule/image";
import Video from "../../../components/molecule/video";
import Pagination from "../../../components/molecule/pagination";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";
import DropdownMenu from "../../../components/molecule/dropdown";

import { DocumentationProps } from "../../../entities/dokumentasi";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

import CreateImage from "./create/image";
import CreateVideo from "./create/video";

const DokumentasiPage: React.FC<{ activeTab?: string }> = ({ activeTab: initialActiveTab }) => {
  const itemsPerPage = 9;
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const userId = Number(localStorage.getItem("id"));
  const role = localStorage.getItem("role");

  const { data: imagesData, loading: imagesLoading, error: imagesError, refetch: imagesRefetch } = useFetchData<DocumentationProps[]>(`${baseUrl}/api/documentation/images`);
  const { data: videosData, loading: videosLoading, error: videosError, refetch: videosRefetch } = useFetchData<DocumentationProps[]>(`${baseUrl}/api/documentation/videos`);

  const [images, setImages] = useState<DocumentationProps[]>([]);
  const [videos, setVideos] = useState<DocumentationProps[]>([]);

  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen: isDeleteModalOpen, openModal: deleteModalOpen, closeModal: deleteModalClose } = useModal();
  const [selectedDocumentation, setSelectedDocumentation] = useState<{ id: number; judul: string } | null>(null);

  const activeTabFromUrl = location.pathname.includes("video") ? "Video Kegiatan" : "Foto Kegiatan";
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab || activeTabFromUrl);
  const [selectedImageResearchFilter, setSelectedImageResearchFilter] = useState<string>("Semua Penelitian");
  const [selectedVideoResearchFilter, setSelectedVideoResearchFilter] = useState<string>("Semua Penelitian");

  useEffect(() => {
    if (imagesData) {
      const filteredImages = role === 'admin'
      ? imagesData.filter((img) =>
          img.research?.some((r) => r.user_id === userId)
        )
      : imagesData.filter((img) => img.about_id !== 1);

      const sortedImages = Array.isArray(filteredImages)
        ? [...filteredImages].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          })
        : [];

      setImages(sortedImages);
    }
  }, [imagesData, userId, role]);

  useEffect(() => {
    if (videosData) {
      const filteredVideos = role === 'admin'
        ? videosData.filter((vid) => vid.research?.some((r) => r.user_id === userId))
        : videosData;

      const sortedVideos = Array.isArray(filteredVideos)
        ? [...filteredVideos].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          })
        : [];

      setVideos(sortedVideos);
    }
  }, [videosData, userId, role]);

  const { filteredData: filteredImages, searchQuery } = useSearch<DocumentationProps>(images, (item) => item.judul);
  const { filteredData: filteredVideos } = useSearch<DocumentationProps>(videos, (item) => item.judul);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(tab === "Foto Kegiatan" ? "/admin/dokumentasi/foto" : "/admin/dokumentasi/video");
  };

  useEffect(() => {
    setActiveTab(activeTabFromUrl);
  }, [activeTabFromUrl]);

  const { deleteData, loading: isDeleting } = useDelete(baseUrl);

  const handleDeleteClick = (id: number, judul: string) => {
    setSelectedDocumentation({ id, judul });
    deleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!selectedDocumentation) return;
    try {
      await deleteData(`api/documentation/${selectedDocumentation.id}`, () => {
        setVideos((prevVideo) => prevVideo.filter((video) => video.id !== selectedDocumentation.id));
        addToast("success", `Dokumentasi berhasil dihapus.`);
        setTimeout(() => { window.location.reload() }, 500);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus dokumentasi.");
    } finally {
      deleteModalClose();
    }
  };

  const getUniqueResearchTitles = (docs: DocumentationProps[]) => {
    const titles = docs.flatMap((doc) =>
      doc.research
        ?.filter((r) => role !== 'admin' || r.user_id === userId)
        .map((r) => r.judul) || []
    );
  
    return ["Semua Penelitian", ...Array.from(new Set(titles))];
  };  

  const filterImagesByResearch = (docs: DocumentationProps[]) => {
    if (selectedImageResearchFilter === "Semua Penelitian") return docs;
    return docs.filter(doc => doc.research?.some(r => r.judul === selectedImageResearchFilter));
  };

  const filterVideosByResearch = (docs: DocumentationProps[]) => {
    if (selectedVideoResearchFilter === "Semua Penelitian") return docs;
    return docs.filter(doc => doc.research?.some(r => r.judul === selectedVideoResearchFilter));
  };

  const filteredImagesByResearch = filterImagesByResearch(searchQuery ? filteredImages : images);
  const filteredVideosByResearch = filterVideosByResearch(filteredVideos.length > 0 ? filteredVideos : videos);

  const { currentPage, paginatedData, setPage } = usePagination<DocumentationProps>(itemsPerPage, filteredImagesByResearch);
  const { currentPage: videoPage, paginatedData: paginatedVideos, setPage: setVideoPage } = usePagination<DocumentationProps>(itemsPerPage, filteredVideosByResearch);

  if (imagesLoading || videosLoading) return <Loading />;
  if (imagesError) return <div>{imagesError}</div>;
  if (videosError) return <div>{videosError}</div>;
  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Dokumentasi
      </Typography>

      <div className="flex overflow-x-auto whitespace-nowrap space-x-4 border-b-2 border-typo-outline pb-1">
        {["Foto Kegiatan", "Video Kegiatan"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`${
              activeTab === tab ? "text-primary" : "text-typo-secondary hover:text-primary font-medium"
            }`}
          >
            <Typography type="button" font="dm-sans" weight={activeTab === tab ? "semibold" : "regular"}>
              {tab}
            </Typography>
          </button>
        ))}
      </div>

      {activeTab === "Foto Kegiatan" && (
        <>
          <div className="md:flex md:justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Typography type="body" className="text-typo-secondary">Filter:</Typography>
              <DropdownMenu
                items={getUniqueResearchTitles(images).map((title) => ({
                  label: title,
                  onClick: () => setSelectedImageResearchFilter(title),
                }))}
                variant="box"
                trigger={
                  <div className="w-full">
                    <Typography 
                      type="body" 
                     
                      weight="medium" 
                      className="w-full text-center px-4 py-2 border rounded-md"
                    >
                      {selectedImageResearchFilter}
                    </Typography>
                  </div>
                }
              />
            </div>    
            <CreateImage onSuccess={imagesRefetch}/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {paginatedData.length === 0 ? (
              <Typography type="body" className="text-typo-secondary mt-4">
                Belum ada gambar yang tersedia.
              </Typography>
            ) : (
              paginatedData.map((image, index) => (
                <Image 
                  key={image.id} 
                  image={image} 
                  index={index} 
                  images={paginatedData} 
                  baseUrl={baseUrl} 
                  showOptions={true} 
                  onDelete={handleDeleteClick} 
                  isDeleting={isDeleting} 
                  variant="detail" 
                  mode="admin"
                  refetch={imagesRefetch}
                />
              ))
            )}
          </div>

          <div className="w-full flex items-end justify-end">
            {paginatedData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredImages.length || images.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}

      {activeTab === "Video Kegiatan" && (
        <>
          <div className="md:flex md:justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Typography type="body" className="text-typo-secondary">Filter:</Typography>
              <DropdownMenu
                items={getUniqueResearchTitles(videos).map((title) => ({
                  label: title,
                  onClick: () => setSelectedVideoResearchFilter(title),
                }))}
                variant="box"
                trigger={<Typography type="body" weight="medium">{selectedVideoResearchFilter}</Typography>}
              />
            </div>
            <CreateVideo onSuccess={videosRefetch}/>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {paginatedVideos.length === 0 ? (
              <Typography type="body" className="text-typo-secondary mt-4">
                Belum ada video yang tersedia.
              </Typography>
            ) : (
              paginatedVideos.map((video) => (
                <Video
                  key={video.id}
                  video={{ ...video, youtube_link: video.youtube_link ?? null }}
                  onDelete={handleDeleteClick}
                  isDeleting={isDeleting}
                  mode="admin"
                  refetch={videosRefetch}
                />
              ))
            )}
          </div>

          <div className="w-full flex items-end justify-end">
            {paginatedVideos.length > 0 && (
              <Pagination
                currentPage={videoPage}
                totalItems={filteredVideos.length || videos.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setVideoPage}
              />
            )}
          </div>
        </>
      )}

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isDeleteModalOpen}
        onClose={deleteModalClose}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Dokumentasi"
        message={`Apakah Anda yakin ingin menghapus dokumentasi ini?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DokumentasiPage;