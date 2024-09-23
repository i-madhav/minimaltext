import { createBrowserRouter } from 'react-router-dom'
import './App.css'
import MinimalistNotepad from './components/note'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'

function App() {
  return (
    <>
      <MinimalistNotepad/>
    </>
  )
}

const AppRouter = createBrowserRouter([
  {
    path:"/",
    element:<MinimalistNotepad/>
  },
  {
    path:"/sign-in",
    element:<SignIn/>
  },
  {
    path:"/sign-up",
    element:<SignUp/>
  }
])

export default AppRouter;
