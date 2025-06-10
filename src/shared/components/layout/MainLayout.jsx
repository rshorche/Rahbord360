import { Outlet } from "react-router-dom"; 

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 text-center">
        <h1 className="text-2xl font-bold text-primary-700">راهبرد 360</h1>
      </header>

      <main className="flex-grow container mx-auto p-4">
       
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white p-3 text-center text-sm">
        &copy; 2025 راهبرد 360. تمامی حقوق محفوظ است.
      </footer>
    </div>
  );
}
