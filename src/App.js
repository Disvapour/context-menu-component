import ContextMenu from "./components/ContextMenu";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

export default function App() {
  const items = [
    {
      message: "Copy",
      function: () => {
        console.log("Copied");
      },
      id: "copy_context"
    },
    {
      message: "Paste",
      function: () => {
        console.log("Pasted");
      },
      id: "paste_context"
    },
    "divider",
    {
      message: "View in other App",
      items: [
        {
          message: "Chrome",
          function: () => {
            console.log("Opened in Chrome");
          },
          id: "open_chrome"
        },
        {
          message: "Edge",
          function: () => {
            console.log("Opened in Edge");
          },
          id: "edge"
        },
        {
          message: "Another App",
          items: [
            {
              message: "Chrome",
              function: () => {
                console.log("Opened in Chrome");
              },
              id: "open_chrome"
            },
            {
              message: "Edge",
              function: () => {
                console.log("Opened in Edge");
              },
              id: "edge"
            }
          ],
          id: "view_other_apps"
        }
      ],
      id: "view_other_app"
    },
    {
      message: "Select other App",
      items: [
        {
          message: "Chrome",
          function: () => {
            console.log("Opened in Chrome");
          },
          id: "select_chrome"
        },
        {
          message: "Edge",
          function: () => {
            console.log("Opened in Edge");
          },
          id: "select_edge"
        }
      ],
      id: "select_other_app"
    },
    "divider",
    {
      message: "Details",
      function: () => {
        console.log("Javascript Details");
      },
      id: "js_details"
    }
  ];
  const copyButtonContext = [
    {
      message: "Copy text",
      function: async () => {
        await navigator.clipboard.writeText(
          document?.querySelector("#anchored-menu")?.innerHTML
        );
      },
      id: "copy_button_text"
    }
  ];
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState(items);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      setMousePos({ x: e.clientX, y: e.clientY });
      setContextMenuOpen(true);
    });
    document.addEventListener(
      "mousedown",
      (e) => {
        e.target.closest("#context-menu") ?? setContextMenuOpen(false);
        e.target.closest("#context-menu") ?? setDropdownItems(items);
      },
      false
    );
  }, []);
  return (
    <div className="App">
      <motion.div
        onClick={() => {
          setDropDownOpen(!dropDownOpen);
        }}
        onContextMenuCapture={(e) => {
          setDropdownItems(copyButtonContext);
        }}
        style={{ position: "absolute", top: "5rem" }}
        id="anchored-menu"
        drag
      >
        Left Click <br />
        or <br />
        Right Click Me
      </motion.div>
      <AnimatePresence>
        {contextMenuOpen && (
          <ContextMenu
            initialX={mousePos.x}
            initialY={mousePos.y}
            items={dropdownItems}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dropDownOpen && typeof window !== "undefined" && (
          <ContextMenu
            anchor="item"
            items={items}
            parentNode={document.querySelector("#anchored-menu")}
            parentId="h1-app"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
