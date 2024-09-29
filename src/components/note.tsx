import React, { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import pen from "../assests/pen-2-svgrepo-com.svg";
import socket from "./socket";

export default function MinimalistNotepad(): JSX.Element {
  const [text, setText] = useState<string>("");
  const [docid, setDocid] = useState<string>("");
  const [newItemText, setNewItemText] = useState<string>("");
  const [items, setItems] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  useEffect(() => {
    const path = window.location.pathname.slice(1);
    if (path.length > 1) {
      handleFetchData(path);
      setDocid(path);
    } else {
      handleDocCreation();
    }
    return () => {
      socket.off("connect"); // Remove event listeners when component unmounts
    };
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

  const handleAddItem = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (newItemText.trim()) {
        setItems((prevItems) => [...prevItems, newItemText.trim()]);
        setNewItemText("");
        setIsPopoverOpen(false);
      }
    },
    [newItemText]
  );

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className=" flex items-center space-x-5">
            <img src={pen} alt="pen" className="w-8 block" />
            <h1 className="text-lg font-bold text-gray-900">
              Minimalist Notepad
            </h1>
          </div>

          <div className=" plusandusercontainer flex items-center gap-10 mr-14">
            <div className="relative">
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewItemText(e.target.value)
                      }
                      aria-label="New item text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className=" relative">
                <div className=" bg-fuchsia-300 rounded-full py-2 px-4 text-center">
                  <p className=" font-bold text-xl">G</p>
                </div>

                <div className="absolute user-information border-gray-800 bg-black text-white">
                    <p>madhav.shar06ma@gmail.com</p>
                    <button className=" bg-white text-black rounded-lg py-2 px-4">
                      Sign Out
                    </button>
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col m-2 overflow-hidden">
        <textarea
          className="flex-grow p-4 bg-white font-mono text-sm focus:outline-none resize-none w-[95%] m-auto border border-black"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
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
