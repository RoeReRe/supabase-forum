import './App.css'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import AllPosts from './AllPosts'
import PostView from './PostView'
import MessageBoard from './MessageBoard'
import Welcome from './Welcome'
import NavBar from './NavBar'

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
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App

function Layout() {
  return <>
    <NavBar />
    <Outlet />
  </>
}
