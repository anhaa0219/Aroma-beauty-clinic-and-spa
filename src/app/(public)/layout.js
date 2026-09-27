import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* The Navbar will sit at the top of every public page */}
      <Navbar />
      
      {/* The page content (like your homepage or services page) goes here */}
      <main className="grow">
        {children}
      </main>
      <Footer/>
    </div>
  );
}