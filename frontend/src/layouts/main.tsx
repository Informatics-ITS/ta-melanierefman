import { Navbar } from '../components/organism/navbar';
import { Footer } from '../components/organism/footer';
import Chatbot from '../components/organism/chatbot';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Chatbot/>
    <Footer />
  </>
);

export default MainLayout;
