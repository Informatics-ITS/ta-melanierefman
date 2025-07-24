import { useState, useRef } from "react";
import { Image, MapPinned, Plus, Type, Video } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { Typography } from "../../../../../../components/atom/typography";
import { Button } from "../../../../../../components/atom/button";
import BackButton from "../../../../../../components/atom/button/back";
import Loading from "../../../../../../components/atom/loading";
import Input from "../../../../../../components/molecule/form/input";
import RichTextEditor from "../../../../../../components/molecule/text-editor";
import Modal from "../../../../../../components/molecule/modal";
import Toast from "../../../../../../components/molecule/toast";
import InputImage from "../../../../../../components/molecule/form/image";

import { useCreateData } from "../../../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../../../hooks/useToast";
import { useModal } from "../../../../../../hooks/useModal";

const CreateProgresPenelitian: React.FC = () => {
  const [searchParams] = useSearchParams();
  const researchId = searchParams.get("researchId");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formValues, setFormValues] = useState({
    judul_progres: "",
    title_progress: "",
  });

  type TextEditorSection = {
    id: string;
    type: "text_editor";
    text_editor_id: string;
    text_editor_en: string;
  };

  type VideoSection = {
    id: string;
    type: "video";
    youtube_link: string;
  };

  type ImageSection = {
    id: string;
    type: "image";
    images: {
      image: File;
      keterangan: string;
      caption: string;
    }[];
  };

  type MapSection = {
    id: string;
    type: "map"
    map_link: string;
    latitude: string;
    longitude: string;
    zoom: string;
  }

  type Section = TextEditorSection | VideoSection | ImageSection | MapSection;
  const [sections, setSections] = useState<Section[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const endOfSectionsRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleAddSection = (type: Section["type"]) => {
    const id = uuidv4();
    const newSection: Section = 
      type === "text_editor"
        ? { id, type, text_editor_id: "", text_editor_en: "" }
        : type === "video"
        ? { id, type, youtube_link: "" }
        : type === "map"
        ? { id, type, map_link: "",latitude: "", longitude: "", zoom: "" }
        : {
            id,
            type,
            images: [
              { image: new File([], ""), keterangan: "", caption: "" }
            ]
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

  const handleDeleteSection = (id: string) => {
    setSections((prevSections) => prevSections.filter((section) => section.id !== id));
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

  const extractFirstParagraph = (sections: Section[], lang: "id" | "en"): string => {
    const textEditors = sections
      .map((section, index) => ({ ...section, originalIndex: index }))
      .filter(s => s.type === "text_editor") as (TextEditorSection & { originalIndex: number })[];

    const sortedTextEditors = textEditors.sort((a, b) => a.originalIndex - b.originalIndex);
    
    for (const editor of sortedTextEditors) {
      const htmlContent = lang === "id" ? editor.text_editor_id : editor.text_editor_en;
      
      if (htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        const paragraphs = doc.querySelectorAll("p");
        
        if (paragraphs.length > 0) {
          const firstP = paragraphs[0];
          const text = firstP?.textContent?.trim();
          
          if (text && text.length > 0) {
            return text;
          }
        }
      }
    }
    
    return "";
  };

  const extractMapData = (url: string) => {
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
    const maps = sectionsWithIndex.filter(s => s.type === "map") as (MapSection & { index_order: number })[];
    const textEditors = sectionsWithIndex.filter(s => s.type === "text_editor") as (TextEditorSection & { index_order: number })[];
    const ImageSections = sectionsWithIndex.filter(s => s.type === "image") as (ImageSection & { index_order: number })[];
    const deskripsi = extractFirstParagraph(sections, "id");
    const description = extractFirstParagraph(sections, "en");
    
    formData.append("deskripsi", deskripsi);
    formData.append("description", description);

    videos.forEach((video, i) => {
      formData.append(`videos[${i}][youtube_link]`, video.youtube_link);
      formData.append(`videos[${i}][index_order]`, video.index_order.toString());
    });

    maps.forEach((map, i) => {
      const extracted = map.map_link ? extractMapData(map.map_link) : null;
    
      formData.append(`maps[${i}][latitude]`, extracted?.latitude || map.latitude || "");
      formData.append(`maps[${i}][longitude]`, extracted?.longitude || map.longitude || "");
      formData.append(`maps[${i}][zoom]`, extracted?.zoom || map.zoom || "");
      formData.append(`maps[${i}][map_link]`, map.map_link || "");
      formData.append(`maps[${i}][index_order]`, map.index_order.toString());
    });    
  
    textEditors.forEach((editor, i) => {
      formData.append(`text_editors[${i}][text_editor_id]`, editor.text_editor_id || "");
      formData.append(`text_editors[${i}][text_editor_en]`, editor.text_editor_en || "");
      formData.append(`text_editors[${i}][index_order]`, editor.index_order.toString());
    });

    ImageSections.forEach((section, sectionIndex) => {
      section.images.forEach((image, imageIndex) => {
        formData.append(`images[${sectionIndex}_${imageIndex}][image]`, image.image);
        formData.append(`images[${sectionIndex}_${imageIndex}][keterangan]`, image.keterangan || "");
        formData.append(`images[${sectionIndex}_${imageIndex}][caption]`, image.caption || "");
        formData.append(`images[${sectionIndex}_${imageIndex}][index_order]`, (section.index_order).toString());
      });
    });

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/research/${researchId}/progress`,
        formData
      );

      if (result) {
        addToast("success", "Progress Penelitian berhasil dibuat!");
        setFormValues({ judul_progres: "", title_progress: "" });
        setSections([]);
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengunggah progress penelitian. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
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
              images: [...section.images, { image: new File([], ""), keterangan: "", caption: "", }]
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

  if (isLoading) return <Loading />;

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
              <div key={section.id} className="p-4 border rounded-md shadow-sm relative bg-typo-white2">
                <div className="flex justify-between mb-4">
                  <Typography type="body" weight="semibold" className="text-typo">
                    {section.type === "text_editor" && `Text Editor-${index + 1}`}
                    {section.type === "video" && `Video-${index + 1}`}
                    {section.type === "map" && `Map-${index + 1}`}
                    {section.type === "image" && `Image-${index + 1}`}
                  </Typography>
                  <Button variant="underline" onClick={() => handleDeleteSection(section.id)}>
                    Hapus
                  </Button>
                </div>

                {section.type === "image" && (
                  <div className="space-y-4">
                    {section.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-lg bg-typo-white relative space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <Typography type="body" weight="semibold">Gambar-{idx + 1}</Typography>
                          <Button variant="underline" onClick={() => handleRemoveImageInput(section.id, idx)}>
                            Hapus
                          </Button>
                        </div>

                        <div className="md:flex flex-row gap-4 items-center">
                          {img.image && img.image.size > 0 && (
                            <img
                              src={URL.createObjectURL(img.image)}
                              alt={`Preview Gambar-${idx + 1}`}
                              className="h-48 md:w-96 w-full object-cover rounded-lg border md:mb-0 mb-4"
                            />
                          )}

                          <InputImage
                            mode="browse"
                            onInputImage={(file) => {
                              if (file) {
                                handleImageInputChange(section.id, idx, "image", file);
                              }
                            }}
                          />
                        </div>
                        <Input
                          id="keterangan"
                          name="keterangan"
                          label="Keterangan (Bahasa Indonesia)"
                          placeholder="Masukkan keterangan"
                          value={img.keterangan}
                          onChange={(e) =>
                            handleImageInputChange(section.id, idx, "keterangan", e.target.value)
                          }
                        />
                        <Input
                          id="caption"
                          name="caption"
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
                      id="youtube_link"
                      name="youtube_link"
                      placeholder="Masukkan link video youtube"
                      value={section.youtube_link || ""} 
                      onChange={(e) => handleSectionChange(section.id, "youtube_link", e.target.value)}
                      error={errors.youtube_link}
                    />
                  </div>
                )}

                {section.type === "map" && (
                  <div className="border p-4 rounded-md bg-typo-white relative space-y-4">
                    <Input
                      label="Google Maps URL"
                      id="map_link"
                      name="map_link"
                      description="Masukkan URL Google Maps dengan koordinat dan zoom level. Contoh: https://www.google.com/maps/@-6.20876,106.84513,12z."
                      placeholder="Masukkan Google Maps URL"
                      value={section.map_link || ""} 
                      onChange={(e) => handleSectionChange(section.id, "map_link", e.target.value)}
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
        <Button type="submit" onClick={handleSubmit} variant="primary" className="md:w-32">Unggah</Button>
      </div>

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan data ini? Silakan konfirmasi untuk melanjutkan."
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

export default CreateProgresPenelitian;