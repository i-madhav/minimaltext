import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import pen from "../assests/pen-2-svgrepo-com.svg";
import socket from "./socket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserInformation } from "@/utils/interfaces";

export default function MinimalistNotepad(): JSX.Element {
  const [text, setText] = useState<string>("");
  const [docid, setDocid] = useState<string>("");
  const [newItemText, setNewItemText] = useState<string>("");
  const [items, setItems] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const[userInformation , setUserInformation] = useState<UserInformation>({});
  const navigate = useNavigate();
  

  useEffect(() => {
    const checkIfUserLoggedIn = async () => {
       await fetchUserInformation();

       if(userInformation){
        await
       }
    }
  },[])

  useEffect(() => {
    const path = window.location.pathname.slice(1);
    if (path.length > 1) {
      handleFetchData(path);
      setDocid(path);
    } else {
      handleDocCreation();
    }
  }, []);

  useEffect(() => {
    if (docid) {
      handleDocumentUpdation(docid, text);
      const socketData = {
        documentId: docid,
        updatedData: text,
      };

      socket.on("connection", () => {
        socket.emit("updatedDataFromTheClient", socketData);
      });
      socket.on("serverResponse", (res) => {
        console.log("I ran insisde res");
        console.log(res);
      });
    }
  }, [text]);


  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  async function handleDocCreation() {
    try {
      const response = await fetch("http://localhost:8000/save", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: "",
          content: text,
        }),
      });

      const data = await response.json();
      if (data) {
        const id = data.data._id;
        setDocid(id);
        window.history.pushState({}, "", `/${id}`);
      }
    } catch (error) {
      console.log("Unable to create a document");
    }
  }

  async function handleDocumentUpdation(id: string, updatedData: string) {
    try {
      const response = await fetch(`http://localhost:8000/save`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          content: updatedData,
        }),
      });

      const data = await response.json();
      if (data.data.text === text) return;
    } catch (error) {
      console.log("Unable to update the document" + error);
    }
  }

  async function handleFetchData(docid: string) {
    try {
      const response = await fetch(`http://localhost:8000/fetch/${docid}`);
      const data = await response.json();
      let stuff = data.data.text;
      setText(stuff);
      localStorage.setItem(`${docid}`, stuff);
    } catch (error) {
      console.log("unable to fetch data from the backend - " + error);
    }
  }

  async function handleSignOut() {
    console.log("I got clicked");
    const response = await fetch("http://localhost:8000/api/v1/user/signout", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      navigate("/sign-in");
    }
  }

  async function fetchUserInformation (){
    try {
      const response = await fetch("http://localhost:8000/api/v1/user/me",{
        method:"GET",
        headers:{ "Content-type": "application/json"},
        credentials:'include'
      });

      if(response.ok){
        const data = await response.json();
        setUserInformation({id:data.data._id , email:data.data.email , fullName:data.data.fullName})
      }
    } catch (error) {
      
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center ">
          <div className=" flex items-center space-x-5">
            <img src={pen} alt="pen" className="w-8 block" />
            <h1 className="text-lg font-bold text-gray-900">
              Minimalist Notepad
            </h1>
          </div>

          <div className=" plusandusercontainer md:flex items-center gap-5 hidden">
            <div>
              <ul className=" flex items-center">
                <li className=" bg-black text-white font-bold py-2 px-3 rounded-full mr-[-.5rem] border-white border-[3px]">
                  M
                </li>
                <li className=" bg-black text-white font-bold py-2 px-3 rounded-full  mr-[-.5rem] border-white border-[3px]">
                  M
                </li>
                <li className=" bg-black text-white font-bold py-2 px-3 rounded-full  mr-[-.5rem] border-white border-[3px]">
                  M
                </li>
                <li className=" bg-black text-white font-bold py-2 px-3 rounded-full  mr-[-.5rem] border-white border-[3px]">
                  M
                </li>
                <li className=" bg-black text-white font-bold py-2 px-3 rounded-full  mr-[-.5rem] border-white border-[3px]">
                  M
                </li>
              </ul>
            </div>
            <div className="">
              <button
                className="p-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                aria-label="Add new item"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
              {isPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <form onSubmit={handleAddItem} className="p-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Add new item"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      aria-label="New item text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className=" hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger className=" bg-black text-white rounded-full font-medium py-2 px-3">
                  M
                </DropdownMenuTrigger>
                <DropdownMenuContent className=" bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-xl">
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <p className="font-medium text-gray-800">
                      madhav.shar06ma@gmail.com
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <button
                      className="font-medium text-red-600 hover:text-red-700"
                      onClick={() => handleSignOut()}
                    >
                      Sign-Out
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <p className="font-medium text-gray-800">
                      shared-with users: 2
                    </p>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <ul>
                      <li>madhav@gmail.com</li>
                      <li>madhav.shar06ma@gmail.com</li>
                    </ul>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-black text-white py-1 px-2 rounded-lg font-medium">
                Open
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-lg">
                <DropdownMenuLabel className="text-gray-700 font-semibold">
                  Details
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-300" />
                <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                  <p className="font-medium text-gray-800">
                    madhav.shar06ma@gmail.com
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70 font-medium text-red-600 hover:text-red-700">
                  Sign-Out
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-300" />
                <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                  <p className="font-medium text-gray-800">
                    shared-with users: 2
                  </p>
                </DropdownMenuItem>

                <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                  <ul>
                    <li>madhav@gmail.com</li>
                    <li>madhav.shar06ma@gmail.com</li>
                  </ul>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col m-2 overflow-hidden">
        <textarea
          className="flex-grow p-4 bg-white font-mono text-sm focus:outline-none resize-none w-[95%] m-auto border border-black"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing here..."
          aria-label="Notepad content"
        />
      </main>

      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-gray-500">
          <p>Characters: {text.length}</p>
          <p>Words: {wordCount}</p>
        </div>
      </footer>
    </div>
  );
}
