import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {IoIosArrowForward} from 'react-icons/io';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: var(--ctx-padding);
  gap: var(--ctx-padding);
  position: absolute;
  width: fit-content;
  border-radius: var(--ctx-border-radius);
  background-color: var(--ctx-container);
  box-shadow: 0 6px 14px -3px #0006;
  max-width: calc(100vw - var(--ctx-border-radius));
  max-height: calc(100vh - var(--ctx-border-radius));
  overflow: auto;
  z-index: 99999999;
`
const Item = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 20px;
  color: var(--ctx-color);
  background-color: var(--ctx-button);
  font-weight: 500;
  position: relative;
  height: var(--ctx-item-height);
  white-space: nowrap;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: calc(var(--ctx-border-radius) - var(--ctx-padding));
  border: 0;
  outline: 0;
  cursor: pointer;
  &:hover, :focus, &.nested.open{
    background-color: var(--ctx-button-hover);
  }
  &:active{
    background-color: var(--ctx-button-active)!important;
  }
  &.selected{
    box-shadow: 0 0 0 1px var(--ctx-button-active);
  }
  &.nested{
    padding-right: 3rem;
    & > svg{
      position: absolute;
      right: .5rem;
      font-size: 22px;
    }
  }
`;
const Divider = styled.div`
  width: 100%;
  height: 2px;
  background-color: var(--ctx-button-hover);
`

const ContextMenu = (props) => {
  const { items, initialX, initialY, parentNode, anchor } = props;
  const [openedMenu, setOpenedMenu] = useState('');
  const [contextPosition, setContextPosition] = useState({ top: initialX, left: initialY });
  const [focusedItem, setFocusedItem] = useState(null);
  const [focusableElements, setFocusableElements] = useState([]);
  const ContextMenuRef= useCallback((node)=>{
    if(node !== null){
      let width = node.getBoundingClientRect().width;
      let height = node.getBoundingClientRect().height;
      switch(anchor){
        case 'item': 
        let parentNodeRect = parentNode?.getBoundingClientRect();
        setContextPosition({
          top:
            document?.documentElement?.scrollTop + parentNodeRect?.top <
            document?.documentElement?.scrollTop +
              document?.documentElement?.clientHeight -
              height
              ? document?.documentElement?.scrollTop +
                parentNodeRect?.top
              : document?.documentElement?.scrollTop +
                parentNodeRect?.bottom -
                height,
                left:
                document?.documentElement?.scrollLeft + parentNodeRect?.right <
                document?.documentElement?.scrollLeft +
                  document?.documentElement?.clientWidth -
                  width
                  ? document?.documentElement?.scrollLeft +
                    parentNodeRect?.right
                  : (document?.documentElement?.scrollLeft +
                    parentNodeRect?.left -
                    width) > document?.documentElement?.scrollLeft ? document?.documentElement?.scrollLeft +
                    parentNodeRect?.left -
                    width  : document?.documentElement?.scrollLeft,
        });
        break;
        default: 
        setContextPosition({ 
          top: `${initialY + document?.documentElement?.scrollTop < document?.documentElement?.clientHeight + document?.documentElement?.scrollTop - height - 6 ? initialY + document?.documentElement?.scrollTop : document?.documentElement?.clientHeight + document?.documentElement?.scrollTop - height - 6}px`, 
          left:
                document?.documentElement?.scrollLeft + initialX <
                document?.documentElement?.scrollLeft +
                  document?.documentElement?.clientWidth -
                  width - 6
                  ? document?.documentElement?.scrollLeft +
                    initialX
                  : document?.documentElement?.scrollLeft +
                  document?.documentElement?.clientWidth -
                  width - 6});
        break;
      }
    }
  },[initialX, initialY, anchor, parentNode])
  const MenuRef = useRef(null);
  const handleKeyDown = useCallback((e, currentItem, parentId)=>{
    let ContextItems = MenuRef?.current?.children;
    switch(e.key){
      case "ArrowDown": 
        e.preventDefault();
        if(currentItem + 1 < focusableElements?.length){
        ContextItems?.item(focusableElements[currentItem + 1])?.focus();
        setFocusedItem(currentItem + 1);
        } else{
          ContextItems?.item(0)?.focus();
          setFocusedItem(0);
        }
        break;
      case "ArrowUp": 
        e.preventDefault();
        if(currentItem - 1 > -1 && currentItem !== -1){
          ContextItems?.item(focusableElements[currentItem - 1])?.focus();
        } else{
          ContextItems?.item(focusableElements[focusableElements?.length - 1])?.focus();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        setOpenedMenu(parentId);
        setTimeout(()=>{document?.querySelector(`[data-child-id="${parentId}"]`)?.children[0]?.focus();},100)
        break;
      case "ArrowLeft":
        e.preventDefault();
        parentNode?.focus();
        setOpenedMenu('');
        break;
      case "Tab":
        e.preventDefault();
        if(!e.shiftKey){
          if(currentItem + 1 < focusableElements?.length){
            ContextItems?.item(focusableElements[currentItem + 1])?.focus();
            setFocusedItem(currentItem + 1);
            } else{
              ContextItems?.item(0)?.focus();
              setFocusedItem(0);
            }
        } else{
          if(currentItem - 1 > -1 && currentItem !== -1){
            ContextItems?.item(focusableElements[currentItem - 1])?.focus();
          } else{
            ContextItems?.item(focusableElements[focusableElements?.length - 1])?.focus();
          }
        }
        break;
      default: break;
    }
  },[focusableElements])
  useEffect(()=>{
    let focusableIndexes = []
    for(let i = 0; i < items.length; i++){
      if(items[i] !== 'divider'){focusableIndexes.push(i)};
    }
    setFocusableElements(focusableIndexes);
    items?.length > 0 && document.addEventListener('keydown', (e)=>{handleKeyDown(e, -1);})
    return()=>{document.removeEventListener('keydown', (e)=>{handleKeyDown(e, -1);})}
  },[items])
  return (
    items?.length > 0 && typeof window !== "undefined" && createPortal(<Container onKeyDown={(e)=>{e.stopPropagation();handleKeyDown(e, -1)}} ref={(el)=>{ContextMenuRef(el); MenuRef.current = el}} initial={{y: -4, opacity: 0}} animate={{y: 0, opacity: 1}} {...props} style={{top: contextPosition?.top, left: contextPosition?.left, ...props?.style}} id="context-menu">
      {items?.map((item, i) => {
        let Identifier = item ==="divider" ? `${item}_${i}` : `${item?.message}_${props?.parentId ? `${props?.parentId}_` : ''}${item?.id}`
        return (
          <React.Fragment key={Identifier}>
            {item === "divider" ?
            <Divider />
             :
            <Item onKeyDown={(e)=>{e.stopPropagation();handleKeyDown(e, focusedItem, Identifier)}} data-context-id={Identifier} className={`${item?.items?.length > 0 ? "nested" : ''}${openedMenu === Identifier ? " open" : ""}${focusableElements[focusedItem] === i ? ' selected' : ''}`} onMouseLeave={()=>{setOpenedMenu('')}} onMouseOver={()=>{setOpenedMenu(Identifier)}} onBlur={()=>{setOpenedMenu('')}} onFocus={()=>{setFocusedItem(focusableElements?.findIndex(index => index === i))}} onClick={item?.function}>
            {item?.message} {item?.items?.length > 0 && <IoIosArrowForward />}
            </Item>
            }
            {item?.items &&
              <AnimatePresence>
              {openedMenu === Identifier && <ContextMenu data-child-id={Identifier} anchor="item" parentNode={document.querySelector(`[data-context-id="${Identifier}"]`)} onMouseLeave={()=>{setOpenedMenu('')}} onMouseOver={()=>{setOpenedMenu(Identifier);}} onBlur={()=>{setOpenedMenu('')}} onFocus={()=>{setOpenedMenu(Identifier)}} parentId={item?.id} items={item?.items} />}
            </AnimatePresence>}
          </React.Fragment>
        );
      })}
    </Container>, document?.body)
  );
};

export default ContextMenu;
