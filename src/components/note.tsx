import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { HashLoader, PacmanLoader } from "react-spinners";

export default function MinimalistNotepad(): JSX.Element {
  const { toast } = useToast();
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [docid, setDocid] = useState<string>("");
  const [newItemText, setNewItemText] = useState<string>("");
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [userInformation, setUserInformation] = useState<UserInformation>({
    id: "",
    email: "",
    fullName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const path = window.location.pathname.slice(1);

    const initializeData = async () => {
      try {
        const userData = await fetchUserInformation();
        const userId = userData?.id || "";
        if (path) {
          setDocid(path);
          await handleFetchData(path, userId);
        } else {
          await handleDocumentCreation(userId);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (docid) {
      const socketData = {
        id: docid,
        userid: userInformation.id,
        content: text,
        sharedWith: [],
      };
      socket.emit("updatedDataFromTheClient", socketData);

     socket.on("serverResponse", (res) => {
       console.log(res);
     });
    }}, [text, docid]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  async function handleDocumentCreation(userid: string) {
    try {
      if (userid.length > 0) {
        setLoading(true);
        const response = await fetch(
          "https://minimalisticbackend.onrender.com/api/v1/document/generate",
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: "",
              userid: userid,
            }),
          }
        );

        const data = await response.json();
        if (data) {
          console.log(data);
          const id = data.data._id;
          setDocid(id);
          window.history.pushState({}, "", `/${id}`);
          setLoading(false);
        }
      } else {
        setLoading(true);
        const response = await fetch(
          "https://minimalisticbackend.onrender.com/api/v1/document/generate",
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: "",
              userid: "",
            }),
          }
        );

        const data = await response.json();
        if (data) {
          const id = data.data._id;
          setDocid(id);
          window.history.pushState({}, "", `/${id}`);
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      console.log("Unable to create a document");
    }
  }

  async function handleFetchData(docid: string, userid: string) {
    try {
      if (userid.length > 0) {
        setLoading(true);
        const response = await fetch(
          "https://minimalisticbackend.onrender.com/api/v1/document/fetch?type=LoggedInUser",
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: docid,
              userid: userid,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log(`This thing ${data}`);
          if (data && !data.data.document) {
            console.log("Into my desired block");
            console.log(data.data.content);
            setText(data.data.content);
            setShareWith([]);
          }else{
            setText(data.data.document.content);
            setShareWith(data.data.shareWithEmail);
          }
          setLoading(false);
        } else {
          toast({
            title: "Permission Denied",
            description: "You Do not have permission to access",
          });
          setLoading(false);
        }
      } else {
        setLoading(true);
        const response = await fetch(
          "https://minimalisticbackend.onrender.com/api/v1/document/fetch?type=NonLoggedInUser",
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: docid,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setText(data.data.content);
          }
          setLoading(false);
        } else {
          toast({
            title: "You do not have permission to access this document",
            description: "This document is a protected document",
          });
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Unable to fetch document",
      });
      console.log(error);
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    const response = await fetch("https://minimalisticbackend.onrender.com/api/v1/user/signout", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      setLoading(false);
      navigate("/sign-in");
    }
  }

  const fetchUserInformation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("https://minimalisticbackend.onrender.com/api/v1/user/me", {
        method: "GET",
        headers: { "Content-type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("This is data of the user");
        console.log(data.data._id);
        if (data) {
          const userData = {
            id: data.data._id || "",
            email: data.data.email || "",
            fullName: data.data.fullName || "",
          };
          setUserInformation(userData);
          setLoading(false);
          return userData; 
        }
      } else {
        setLoading(false);
        return null;
      }
    } catch (error) {
      setLoading(false);
      return null;
    }
  }, []);

  async function handleAddShareWith() {
    try {
      setLoading(true);
      const response = await fetch(
        "https://minimalisticbackend.onrender.com/api/v1/document/sharedwith/add",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: docid,
            userid: userInformation.id,
            shareWith: newItemText,
          }),
        }
      );
      if (response.ok) {
        setIsPopoverOpen(false);
        const data = await response.json();
        setShareWith(data.data.sharedWith);
        setNewItemText(" ");
        setIsPopoverOpen(false);
        setLoading(false);
      } else {
        setNewItemText(" ");
        setIsPopoverOpen(false);
        toast({
          title: "Not Registered User",
          description:
            "Please make sure the user you are adding is a registred user",
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("unable to add share with user");
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
            {loading && (
              <PacmanLoader
                size={"20px"}
                color="#000"
                loading
                cssOverride={{
                  marginRight: "80px",
                }}
              />
            )}
            <div>
              <ul className=" flex items-center">
                {shareWith.length > 0
                  ? shareWith.map((item , index) => (
                      <li key={index} className=" bg-black text-white font-bold w-11 py-2 text-center rounded-full mr-[-.5rem] border-white border-[3px]">
                        {item?.slice(0, 1).toUpperCase()}
                      </li>
                    ))
                  : "No Share"}
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
                  <div className="p-4 space-y-2 flex flex-col text-center">
                    <input
                      type="text"
                      placeholder="ShareDocument With"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      aria-label="ShareDocument With"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {userInformation.id ? (
                      <button
                        className="w-full px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        onClick={() => handleAddShareWith()}
                      >
                        Add
                      </button>
                    ) : (
                      <Link
                        className=" px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        to={"/sign-in"}
                      >
                        SignIn
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className=" hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger className=" bg-black text-white rounded-full font-medium w-10 h-10">
                  {userInformation.fullName?.slice(0, 1).toUpperCase() || "G"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className=" bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-xl">
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <p className="font-medium text-gray-800">
                      {userInformation.email || "Guest-User"}
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    {!userInformation.email ? (
                      <Link
                        className="font-medium hover:text-red-700 w-full text-left"
                        to={"/sign-in"}
                      >
                        Sign-In
                      </Link>
                    ) : (
                      <button
                        className="font-medium text-red-600 hover:text-red-700 w-full text-left"
                        onClick={() => handleSignOut()}
                      >
                        Sign-Out
                      </button>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <p className="font-medium text-gray-800">
                      shared-with users: {shareWith.length}
                    </p>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="focus:bg-gray-200 focus:bg-opacity-70">
                    <ul>
                      {shareWith.map((item , index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-5">
            {loading && <HashLoader size={20} color="#000" loading />}
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