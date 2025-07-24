import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/main';
import AdminLayout from './layouts/admin';
import ScrollToTop from './layouts/scroll';

import Home from './pages/main/home';
import Tentang from './pages/main/tentang';
import Anggota from './pages/main/anggota';
import AnggotaDetail from './pages/main/anggota/[id]';
import Penelitian from './pages/main/penelitian';
import DetailPenelitian from './pages/main/penelitian/[id]';
import ProgresPenelitian from './pages/main/penelitian/[id]/[progress]';
import FotoPenelitian from './pages/main/penelitian/[id]/[photo]';
import VideoPenelitian from './pages/main/penelitian/[id]/[video]';
import PenelitianTahun from './pages/main/penelitian/[tahun]';
import Publikasi from './pages/main/publikasi';
import PublikasiTahun from './pages/main/publikasi/[tahun]';
import Kerjasama from './pages/main/kerjasama';
import Kontak from './pages/main/kontak';
import Materi from './pages/main/materi';
import MateriVideo from './pages/main/materi/[video]';

import Login from './pages/admin/login';

import Dashboard from './pages/admin/dashboard';
import Profile from './pages/admin/profile';
import Akun from './pages/admin/akun';
import CreateAkun from './pages/admin/akun/create';
import EditAkun from './pages/admin/akun/edit';
import TentangAdmin from './pages/admin/tentang';
import KontakAdmin from './pages/admin/kontak';
import AnggotaAdmin from './pages/admin/anggota';
import CreatePeneliti from './pages/admin/anggota/create/peneliti';
import CreateMahasiswa from './pages/admin/anggota/create/mahasiswa';
import EditPeneliti from './pages/admin/anggota/edit/peneliti';
import EditMahasiswa from './pages/admin/anggota/edit/mahasiswa';
import PenelitianAdmin from './pages/admin/penelitian';
import CreatePenelitian from './pages/admin/penelitian/create';
import EditPenelitian from './pages/admin/penelitian/edit';
import DetailPenelitianAdmin from './pages/admin/penelitian/[id]';
import CreateProgresPenelitian from './pages/admin/penelitian/[id]/progres penelitian/create';
import PublikasiAdmin from './pages/admin/publikasi';
import CreatePublikasi from './pages/admin/publikasi/create';
import EditPublikasi from './pages/admin/publikasi/edit';
import KerjasamaAdmin from './pages/admin/kerjasama';
import CreateKerjasama from './pages/admin/kerjasama/create';
import EditKerjasama from './pages/admin/kerjasama/edit';
import MateriAdmin from './pages/admin/materi';
import DokumentasiPage from './pages/admin/dokumentasi';

import ResearchProgressList from './pages/main/penelitian/[id]/[progress]/[id]';
import Preview from './pages/admin/tentang/preview';
import ViewProgresPenelitian from './pages/admin/penelitian/[id]/progres penelitian/view';
import EditProgresPenelitian from './pages/admin/penelitian/[id]/progres penelitian/edit';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />

        <Route
          path="/id/*"
          element={
            <>
              <MainLayout>
                <Routes>
                  <Route path="" element={<Home />} />
                  <Route path="/tentang" element={<Tentang />} />
                  <Route path="/anggota" element={<Anggota />} />
                  <Route path="/anggota/:nama" element={<AnggotaDetail />} />
                  <Route path="/penelitian" element={<Penelitian />} />
                  <Route path="/penelitian/:title" element={<DetailPenelitian />} />
                  <Route path="/penelitian/:title/progres" element={<ResearchProgressList />} />
                  <Route path="/penelitian/:title/progres/:progressTitle" element={<ProgresPenelitian />} />
                  <Route path="/penelitian/:title/foto" element={<FotoPenelitian />} />
                  <Route path="/penelitian/:title/video" element={<VideoPenelitian />} />
                  <Route path="/penelitian/archive/:year" element={<PenelitianTahun />} />
                  <Route path="/publikasi" element={<Publikasi />} />
                  <Route path="/publikasi/archive/:year" element={<PublikasiTahun />} />
                  <Route path="/kerjasama" element={<Kerjasama />} />
                  <Route path="/kontak" element={<Kontak />} />
                  <Route path="/materi" element={<Materi />} />
                  <Route path="/materi/video" element={<MateriVideo />} />
                </Routes>
              </MainLayout>
            </>
          }
        />

        <Route
          path="/en/*"
          element={
            <>
              <MainLayout>
                <Routes>
                  <Route path="" element={<Home />} />
                  <Route path="/about" element={<Tentang />} />
                  <Route path="/members" element={<Anggota />} />
                  <Route path="/members/:nama" element={<AnggotaDetail />} />
                  <Route path="/research" element={<Penelitian />} />
                  <Route path="/research/:title" element={<DetailPenelitian />} />
                  <Route path="/research/:title/progress" element={<ResearchProgressList />} />
                  <Route path="/research/:title/progress/:progressTitle" element={<ProgresPenelitian />} />
                  <Route path="/research/:title/photos" element={<FotoPenelitian />} />
                  <Route path="/research/:title/videos" element={<VideoPenelitian />} />
                  <Route path="/research/archive/:year" element={<PenelitianTahun />} />
                  <Route path="/publication" element={<Publikasi />} />
                  <Route path="/publication/archive/:year" element={<PublikasiTahun />} />
                  <Route path="/partners" element={<Kerjasama />} />
                  <Route path="/contact" element={<Kontak />} />
                  <Route path="/lecturer" element={<Materi />} />
                  <Route path="/lecturer/videos" element={<MateriVideo />} />
                </Routes>
              </MainLayout>
            </>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/*"
          element={
            <>
              <ScrollToTop targetId="admin-main-content" />
              <AdminLayout>
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/akun" element={<Akun />} />
                  <Route path="/tambah-akun" element={<CreateAkun />} />
                  <Route path="/edit-akun/:id" element={<EditAkun />} />
                  <Route path="/tentang" element={<TentangAdmin />} />
                  <Route path="/kontak" element={<KontakAdmin />} />
                  <Route path="/anggota" element={<AnggotaAdmin />} />
                  <Route path="/anggota/tambah-peneliti" element={<CreatePeneliti type="peneliti"/>} />
                  <Route path="/anggota/tambah-postdoctoral" element={<CreatePeneliti type="postdoctoral"/>} />
                  <Route path="/anggota/tambah-asisten-riset" element={<CreatePeneliti type="asisten-riset"/>} />
                  <Route path="/anggota/tambah-mahasiswa" element={<CreateMahasiswa />} />
                  <Route path="/anggota/edit-peneliti/:id" element={<EditPeneliti type="peneliti"/>} />
                  <Route path="/anggota/edit-postdoctoral/:id" element={<EditPeneliti type="postdoctoral"/>} />
                  <Route path="/anggota/edit-asisten-riset/:id" element={<EditPeneliti type="asisten-riset"/>} />
                  <Route path="/anggota/edit-mahasiswa/:id" element={<EditMahasiswa />} />
                  <Route path="/penelitian" element={<PenelitianAdmin />} />
                  <Route path="/penelitian/:title/" element={<DetailPenelitianAdmin />} />
                  <Route path="/penelitian/tambah-progres-penelitian" element={<CreateProgresPenelitian />} />
                  <Route path="/:title/:progressTitle" element={<ViewProgresPenelitian />} />
                  <Route path="/penelitian/:researchId/progres-penelitian/:progressId/edit" element={<EditProgresPenelitian />} />
                  <Route path="/tambah-penelitian" element={<CreatePenelitian />} />
                  <Route path="/edit-penelitian/:id" element={<EditPenelitian />} />
                  <Route path="/publikasi" element={<PublikasiAdmin />} />
                  <Route path="/publikasi/create" element={<CreatePublikasi/>} />
                  <Route path="/publikasi/edit/:id" element={<EditPublikasi/>} />
                  <Route path="/kerjasama" element={<KerjasamaAdmin />} />
                  <Route path="/kolaborator/create" element={<CreateKerjasama />} />
                  <Route path="/kolaborator/edit/:id" element={<EditKerjasama/>} />
                  <Route path="/materi" element={<MateriAdmin />} />
                  <Route path="/dokumentasi/foto" element={<DokumentasiPage activeTab="Foto Kegiatan" />} />
                  <Route path="/dokumentasi/video" element={<DokumentasiPage activeTab="Video Kegiatan" />} />
                </Routes>
              </AdminLayout>
            </>
          }
        />

        <Route path="/admin/tentang/preview/:lang" element={<Preview />} />

      </Routes>
    </Router>
  );
};

export default App;