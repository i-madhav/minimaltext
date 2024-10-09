import { createBrowserRouter } from 'react-router-dom'
import './App.css'
import MinimalistNotepad from './components/note'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MinimalistNotepad />
  },
  {
    path: "/sign-in",
    element: <SignIn />
  },
  {
    path: "/sign-up",
    element: <SignUp />
  },
  {
    path: "/:docid", 
    element: <MinimalistNotepad />
  }
]);

export default AppRouter;
