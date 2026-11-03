import './App.css'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import AllPosts from './AllPosts'
import { PostView } from './Post'
import MessageBoard from './MessageBoard'
import Welcome, { welcomeLoader } from './Welcome'
import NavBar from './NavBar'
import { SupabaseUserInfo, useSession } from './use-session'
import { createContext } from 'react'
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_API_URL);
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <MessageBoard />,
        children: [
          {
            path: ":pageNumber",
            element: <AllPosts />,
          },
          {
            path: "post/:postId",
            element: <PostView />,
          },
        ]   
      },
      {
        path: "Welcome",
        element: <Welcome />,
        loader: welcomeLoader,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

export const UserContext = createContext<SupabaseUserInfo>({
  session: null,
  profile: null,
});

function Layout() {
  const supabaseUserInfo = useSession();
  
  return (
  <>    
    <UserContext.Provider value={supabaseUserInfo}>
      <NavBar />
      <Outlet />
    </UserContext.Provider>
  </>
  );
}
