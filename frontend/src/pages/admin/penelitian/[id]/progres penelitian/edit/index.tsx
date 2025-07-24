import { useState, useRef, useEffect } from "react";
import { Plus, Image, Type, Video, MapPinned } from "lucide-react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { Typography } from "../../../../../../components/atom/typography";
import { Button } from "../../../../../../components/atom/button";
import Loading from "../../../../../../components/atom/loading";
import BackButton from "../../../../../../components/atom/button/back";
import Input from "../../../../../../components/molecule/form/input";
import InputImage from "../../../../../../components/molecule/form/image";
import RichTextEditor from "../../../../../../components/molecule/text-editor";
import Modal from "../../../../../../components/molecule/modal";
import Toast from "../../../../../../components/molecule/toast";

import { ProgresPenelitianProps } from "../../../../../../entities/progres-penelitian";

import { useFetchData } from "../../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../../../hooks/useToast";
import { useModal } from "../../../../../../hooks/useModal";

const EditProgresPenelitian: React.FC = () => {
  const { researchId, progressId } = useParams<{ researchId: string; progressId: string }>();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<ProgresPenelitianProps>(`${baseUrl}/api/research/id/${researchId}/progress/id/${progressId}`);
  const { updateData } = useUpdateData(`${baseUrl}/api/research/${researchId}/progress/${progressId}`);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    judul_progres: "",
    title_progress: "",
  });

  type TextEditorSection = {
    id: string;
    type: "text_editor";
    text_editor_id: string;
    text_editor_en: string;
    index_order: number;
    db_id?: string | number;
  }

  type VideoSection = {
    id: string;
    type: "video";
    youtube_link: string;
    index_order: number;
    db_id?: string | number;
  };

  type ImageSection = {
    id: string;
    type: "image";
    images: {
      id?: number;
      image: string | File;
      keterangan: string;
      caption: string;
    }[];
    index_order: number;
    db_id?: string | number;
  };

  type MapSection = {
    id: string;
    type: "map"
    map_link: string;
    latitude: string;
    longitude: string;
    zoom: string;
    index_order: number;
    db_id?: string | number;
  }

  type Section = VideoSection | TextEditorSection | ImageSection | MapSection;
  const [sections, setSections] = useState<Section[]>([]);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const endOfSectionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data) return;

    setFormValues({
      judul_progres: data.judul_progres || "",
      title_progress: data.title_progress || "",
    });
  
    const videoSections: VideoSection[] = data.progress_videos?.map((video) => ({
      id: uuidv4(),
      db_id: video.id,
      type: "video",
      youtube_link: video.youtube_link,
      index_order: video.index_order,
    })) ?? [];

    const mapSections: MapSection[] = data.progress_maps?.map((map) => ({
      id: uuidv4(),
      db_id: map.id,
      type: "map",
      map_link: map.map_link,
      longitude: map.longitude,
      latitude: map.latitude,
      zoom: map.zoom,
      index_order: map.index_order,
    })) ?? [];

    const textEditorSections: TextEditorSection[] = data.text_editors?.map((textEditor) => ({
      id: uuidv4(),
      db_id: textEditor.id,
      type: "text_editor",
      text_editor_id: textEditor.text_editor_id,
      text_editor_en: textEditor.text_editor_en,
      index_order: textEditor.index_order,
    })) ?? [];

    const groupImagesByIndexOrder = (progress_images: {
      id: string;
      image: string | File;
      keterangan: string;
      caption: string;
      index_order: number;
    }[]): ImageSection[] => {
      const grouped = new Map<number, ImageSection>();
    
      progress_images.forEach((img) => {
        const index = img.index_order;
        if (!grouped.has(index)) {
          grouped.set(index, {
            id: uuidv4(),
            type: "image",
            images: [],
            index_order: index,
          });
        }
    
        grouped.get(index)?.images.push({
          id: Number(img.id),
          image: img.image,
          keterangan: img.keterangan,
          caption: img.caption,
        });
      });
    
      return Array.from(grouped.values()).sort(
        (a, b) => a.index_order - b.index_order
      );
    };        
    
    const imageSections: ImageSection[] = groupImagesByIndexOrder(data.progress_images ?? []);   
  
    const combinedSections: Section[] = Array.isArray(videoSections) && Array.isArray(textEditorSections) && Array.isArray(imageSections) && Array.isArray(mapSections)
      ? [...videoSections, ...textEditorSections, ...imageSections, ...mapSections].sort(
          (a, b) => (a.index_order ?? 0) - (b.index_order ?? 0)
        )
      : [];
  
    setSections(combinedSections);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  }; 
  
  const handleAddSection = (type: Section["type"]) => {
    const id = uuidv4();
    const index_order = sections.length + 1;

    const newSection: Section = 
      type === "text_editor"
        ? { id, type, text_editor_id: "", text_editor_en: "", index_order }
        : type === "video"
        ? { id, type, youtube_link: "", index_order }
        : type === "map"
        ? { id, type, map_link: "",latitude: "", longitude: "", zoom: "", index_order }
        : {
            id,
            type,
            images: [
              { image: new File([], ""), keterangan: "", caption: "" }
            ],
            index_order
          };
  
    setSections(prev => [...prev, newSection]);
    setDropdownOpen(false);
    setTimeout(() => endOfSectionsRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const handleSectionChange = (id: string, field: string, value: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === id) {
          if (section.type === "video" && field === "youtube_link") {
            return { ...section, youtube_link: value };
          }
  
          if (section.type === "map") {
            if (field === "map_link") {
              const mapData = extractMapData(value);
              return {
                ...section,
                map_link: value,
                latitude: mapData?.latitude || "",
                longitude: mapData?.longitude || "",
                zoom: mapData?.zoom || "",
              };
            }
  
            if (field === "latitude" || field === "longitude" || field === "zoom") {
              return { ...section, [field]: value };
            }
          }
        }
        return section;
      })
    );
  };

  const handleDeleteSection = (index_order: number) => {
    setSections((prevSections) =>
      prevSections.filter((section) => section.index_order !== index_order)
    );
  };

  const handleTextEditorChange = (id: string, lang: "id" | "en", value: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id && section.type === "text_editor"
          ? {
              ...section,
              [lang === "id" ? "text_editor_id" : "text_editor_en"]: value
            }
          : section
      )
    );
  };
   
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: Record<string, string> = {};

    if (!formValues.judul_progres || !formValues.title_progress) newErrors.general = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    openModal();
  };

  const extractFirstParagraph = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const firstP = doc.querySelector("p");
    return firstP?.textContent?.trim() ?? "";
  };

  const extractMapData = (url?: string) => {
    if (!url) return null;
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+(?:\.\d+)?)z/;
    const match = url.match(regex);
    if (match) {
      return {
        latitude: match[1],
        longitude: match[2],
        zoom: Math.floor(parseFloat(match[3])).toString(),
      };
    }
    return null;
  };  
  
  const handleConfirm = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("research_id", researchId ?? "");
    formData.append("judul_progres", formValues.judul_progres);
    formData.append("title_progress", formValues.title_progress);
  
    const sectionsWithIndex = sections.map((section, index) => ({
      ...section,
      index_order: index + 1,
    }));
  
    const videos = sectionsWithIndex.filter(s => s.type === "video") as (VideoSection & { index_order: number })[];
    const maps = sectionsWithIndex.filter(s => s.type ==='map') as (MapSection & { index_order: number })[];
    const textEditors = sectionsWithIndex.filter(s => s.type === "text_editor") as (TextEditorSection & { index_order: number })[];
    const imageSections = sectionsWithIndex.filter(s => s.type === "image") as (ImageSection & { index_order: number })[];
  
    const editorWithSmallestIndex = Array.isArray(textEditors) && textEditors.length > 0
      ? [...textEditors].sort((a, b) => (a.index_order ?? 0) - (b.index_order ?? 0))[0]
      : undefined;

    if (editorWithSmallestIndex) {
      const deskripsi = extractFirstParagraph(editorWithSmallestIndex.text_editor_id || "");
      const description = extractFirstParagraph(editorWithSmallestIndex.text_editor_en || "");
      formData.append("deskripsi", deskripsi);
      formData.append("description", description);
    }
  
    const isValidDbId = (id: any) => typeof id === 'number' && id < 1_000_000;

    videos.forEach((video, i) => {
      if (video.db_id && isValidDbId(video.db_id)) {
        formData.append(`videos[${i}][id]`, video.db_id.toString());
      }
      formData.append(`videos[${i}][youtube_link]`, video.youtube_link);
      formData.append(`videos[${i}][index_order]`, video.index_order.toString());
    });

    maps.forEach((map, i) => {
      if (map.db_id && isValidDbId(map.db_id)) {
        formData.append(`maps[${i}][id]`, map.db_id.toString());
      }
      const extractedMapData = extractMapData(map.map_link);

      formData.append(`maps[${i}][longitude]`, extractedMapData?.longitude || map.longitude);
      formData.append(`maps[${i}][latitude]`, extractedMapData?.latitude || map.latitude);
      formData.append(`maps[${i}][zoom]`, extractedMapData?.zoom || map.zoom);
      
      formData.append(`maps[${i}][map_link]`, map.map_link || "");
      formData.append(`maps[${i}][index_order]`, map.index_order.toString());
    });    

    textEditors.forEach((editor, i) => {
      if (editor.db_id && isValidDbId(editor.db_id)) {
        formData.append(`text_editors[${i}][id]`, editor.db_id.toString());
      }
      formData.append(`text_editors[${i}][text_editor_id]`, editor.text_editor_id || "");
      formData.append(`text_editors[${i}][text_editor_en]`, editor.text_editor_en || "");
      formData.append(`text_editors[${i}][index_order]`, editor.index_order.toString());
    });

    imageSections.forEach((section, sectionIndex) => {
      section.images.forEach((image, imageIndex) => {
        const key = `images[${sectionIndex}_${imageIndex}]`;
        if (isValidDbId((image as any).id)) {
          formData.append(`${key}[id]`, (image as any).id.toString());
        }
        formData.append(`${key}[image]`, image.image);
        formData.append(`${key}[keterangan]`, image.keterangan || "");
        formData.append(`${key}[caption]`, image.caption || "");
        formData.append(`${key}[index_order]`, section.index_order.toString());
      });
    });

    try {
      const response = await updateData(formData);
      if (response.success) {
        addToast("success", "Progress penelitian berhasil diperbarui.");
        closeModal();
      } else {
        addToast("error", "Terjadi kesalahan saat memperbarui progress penelitian.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };  

  const handleAddImageInput = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId && section.type === "image"
          ? {
              ...section,
              images: [...section.images, { image: new File([], ""), keterangan: "", caption: "" }]
            }
          : section
      )
    );
  };
  
  const handleRemoveImageInput = (sectionId: string, imageIndex: number) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId && section.type === "image"
          ? {
              ...section,
              images: section.images.filter((_, idx) => idx !== imageIndex)
            }
          : section
      )
    );
  };
  
  const handleImageInputChange = (
    sectionId: string,
    imageIndex: number,
    key: "image" | "keterangan" | "caption",
    value: File | string
  ) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId && section.type === "image"
          ? {
              ...section,
              images: section.images.map((img, idx) =>
                idx === imageIndex ? { ...img, [key]: value } : img
              )
            }
          : section
      )
    );
  };

  if (loading || isLoading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="px-4 py-4 md:py-10 md:flex justify-between mt-16">
      <div className="space-y-4 md:w-full">
        <div>
          <BackButton />
          <Typography type="heading6" weight="semibold">
            Tambah Progres Penelitian
          </Typography>
        </div>
        <form className="space-y-4">
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul_progres"
            name="judul_progres"
            placeholder="Masukkan judul"
            autoComplete="judul_progres"
            value={formValues.judul_progres}
            onChange={handleChange}
            error={errors.judul_progres}
          />
          <Input
            label="Title (English)"
            id="title_progress"
            name="title_progress"
             placeholder="Enter title in English"
            autoComplete="title_progress"
            value={formValues.title_progress}
            onChange={handleChange}
            error={errors.title_progress}
          />
        </form>
        <div className="underline decoration-primary decoration-2">
          <Typography type="paragraph" weight="semibold">
            Progres Penelitian
          </Typography>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => {
            return (
              <div key={`section-${section.id}-${index}`} className="p-4 border rounded-md shadow-sm relative bg-typo-white2">
                <div className="flex justify-between mb-4">
                  <Typography type="body" weight="semibold" className="text-typo">
                    {section.type === "text_editor" && `Text Editor-${index + 1}`}
                    {section.type === "video" && `Video-${index + 1}`}
                    {section.type === "map" && `Map-${index + 1}`}
                    {section.type === "image" && `Image-${index + 1}`}
                  </Typography>
                  <Button variant="underline" onClick={() => handleDeleteSection(section.index_order)}>
                    Hapus
                  </Button>
                </div>

                {section.type === "image" && (
                  <div className="space-y-4">
                    {section.images.map((img, idx) => (
                      <div
                        key={`${section.id}-image-${idx}`}
                        className="border p-4 rounded-md bg-typo-white relative space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <Typography type="body" weight="semibold">Gambar-{idx + 1}</Typography>
                          <Button
                            variant="underline"
                            onClick={() => handleRemoveImageInput(section.id, idx)}
                          >
                            Hapus
                          </Button>
                        </div>

                        <div className="md:flex flex-row gap-4 items-center">
                          {typeof img.image === "string" ? (
                            <img
                              src={`${baseUrl}/storage/${img.image}`}
                              alt={`Preview Gambar-${idx + 1}`}
                               className="h-48 md:w-96 w-full object-cover rounded-lg border md:mb-0 mb-4"
                            />
                          ) : img.image instanceof File && img.image.size > 0 ? (
                            <img
                              src={URL.createObjectURL(img.image)}
                              alt={`Preview Gambar-${idx + 1}`}
                               className="h-48 md:w-96 w-full object-cover rounded-lg border md:mb-0 mb-4"
                            />
                          ) : null}

                          <InputImage
                            mode="browse"
                            onInputImage={(file) =>
                              file && handleImageInputChange(section.id, idx, "image", file)
                            }
                          />
                        </div>

                        <Input
                          id={`keterangan-${section.id}-${idx}`}
                          name={`keterangan-${section.id}-${idx}`}
                          label="Keterangan (Bahasa Indonesia)"
                          placeholder="Masukkan keterangan"
                          value={img.keterangan}
                          onChange={(e) =>
                            handleImageInputChange(section.id, idx, "keterangan", e.target.value)
                          }
                        />

                        <Input
                          id={`caption-${section.id}-${idx}`}
                          name={`caption-${section.id}-${idx}`}
                          label="Caption (English)"
                          placeholder="Enter caption in English"
                          value={img.caption}
                          onChange={(e) =>
                            handleImageInputChange(section.id, idx, "caption", e.target.value)
                          }
                        />
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      iconLeft={<Plus className="w-6 h-6" />}
                      onClick={() => handleAddImageInput(section.id)}
                    >
                      Tambah Gambar
                    </Button>
                  </div>
                )}

                {section.type === "text_editor" && (
                  <div className="space-y-4">
                    <div className="border p-4 rounded-md bg-typo-white relative space-y-4">
                      <Typography type="caption1" font="dm-sans">Teks Bahasa Indonesia</Typography>
                      <RichTextEditor
                        content={section.text_editor_id || ""} 
                        onChange={(value) => handleTextEditorChange(section.id, "id", value)}
                      />
                    </div>
                    <div className="border p-4 rounded-md bg-typo-white relative space-y-4">
                      <Typography type="caption1" font="dm-sans">English Text</Typography>
                      <RichTextEditor
                        content={section.text_editor_en || ""} 
                        onChange={(value) => handleTextEditorChange(section.id, "en", value)}
                      />
                    </div>
                  </div>
                )}

                {section.type === "video" && (
                  <div className="border p-4 rounded-md bg-typo-white relative space-y-4">
                    <Input
                      label="Link Video"
                      id={`youtube_link-${section.id}`}
                      name={`youtube_link-${section.id}`}
                      placeholder="Masukkan link video youtube"
                      value={section.youtube_link || ""} 
                      onChange={(e) =>
                        handleSectionChange(section.id, "youtube_link", e.target.value)
                      }
                      error={errors.youtube_link}
                    />
                  </div>
                )}

                {section.type === "map" && (
                  <div className="border p-4 rounded-md bg-typo-white relative space-y-4">
                    <Input
                      label="Google Maps URL"
                      id={`map_link-${section.id}`}
                      name={`map_link-${section.id}`}
                      description="Masukkan URL Google Maps dengan koordinat dan zoom level. Contoh: https://www.google.com/maps/@-6.20876,106.84513,12z"
                      placeholder="Masukkan Google Maps URL"
                      value={section.map_link || ""} 
                      onChange={(e) =>
                          handleSectionChange(section.id, "map_link", e.target.value)
                        }
                      error={errors.map_link || errors.general}
                    />
                    {(section.latitude && section.longitude && section.zoom) && (
                      <div className="mt-8">
                        <Typography type="caption1" font="dm-sans" className="mb-2">Preview Lokasi di Peta</Typography>
                        <div className="w-full md:h-[450px] h-[200px] rounded-lg overflow-hidden border">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=${section.latitude || '-6.20876'},${section.longitude || '106.84513'}&zoom=${section.zoom || 12}`}
                            loading="lazy"
                            style={{ border: 0 }}
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={endOfSectionsRef}></div>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="w-full"
            iconLeft={<Plus />}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Tambah Section
          </Button>

          {dropdownOpen && (
            <div className="absolute md:top-[-100px] top-[-180px] left-0 w-full bg-white border-2 border-typo-inline rounded-md z-10">
              <div className="grid md:grid-cols-4 grid-cols-2">
                {/* Text Editor */}
                <div
                  className="flex flex-col items-center cursor-pointer hover:bg-gray-100 border-r-2 md:border-b-0 border-b-2 last:border-b-0 border-typo-inline p-2"
                  onClick={() => handleAddSection("text_editor")}
                >
                  <Type size={48} className="text-primary" />
                  <Typography type="body" className="text-typo">Text Editor</Typography>
                </div>

                {/* Image */}
                <div
                  className="flex flex-col items-center cursor-pointer hover:bg-gray-100 md:border-b-0 md:border-r-2 border-b-2 last:border-b-0 border-typo-inline p-2"
                  onClick={() => handleAddSection("image")}
                >
                  <Image size={48} className="text-primary" />
                  <Typography type="body" className="text-typo">Image</Typography>
                </div>

                {/* Video */}
                <div
                  className="flex flex-col items-center cursor-pointer hover:bg-gray-100 border-r-2 last:border-b-0 border-typo-inline p-2"
                  onClick={() => handleAddSection("video")}
                >
                  <Video size={48} className="text-primary" />
                  <Typography type="body" className="text-typo">Video</Typography>
                </div>

                {/* Maps */}
                <div
                  className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-2"
                  onClick={() => handleAddSection("map")}
                >
                  <MapPinned size={48} className="text-primary" />
                  <Typography type="body" className="text-typo">Map</Typography>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="md:fixed md:right-12 md:mt-0 mt-4 space-y-2 flex flex-col">
        <Button type="submit" onClick={handleSubmit} variant="primary" className="md:w-32">Update</Button>
      </div>

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
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

export default EditProgresPenelitian;