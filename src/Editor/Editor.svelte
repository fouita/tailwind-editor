<script>
  import ContentEditor from "./ContentEditor.svelte";
  import ToolBar from "../ToolBar/ToolBar.svelte";
  import MediaInput from "../ToolBar/MediaInput.svelte";
  import EditorHistory from "../lib/EditorHistory";
  import {createEventDispatcher} from 'svelte'
  import "../global.css"
  const dispatch = createEventDispatcher()

  export let arr_html = [{ html: ``, klass: "p-2" }];
  export let editable = false
  export let html = "";
  export let uid = null;

  $: html = arr_html
    .map(h => `<div class='${h.klass}'>${h.html}</div>`)
    .join("\n");
  
  EditorHistory.add(arr_html)

  async function addNewElm(i, evt) {
    // split
    // get element index
    let target = evt.detail.target
    let pchildren = [...target.parentNode.children]
    let index = pchildren.indexOf(target)
    arr_html.splice(
      i,
      1,
      { html: evt.detail.html, klass: evt.detail.klass, custom: arr_html[i].custom },
      { html: evt.detail.next_html, klass: '' } //evt.detail.klass
    );
    // auto focus
    arr_html = arr_html;
	  await new Promise(r => setTimeout(r));
	  
	  let div_editors = [...target.parentNode.children] //GET children again after timeout refresh!
    // next element
   
    let j= 1;
    while(div_editors[index + j] && !div_editors[index + j].getAttribute('contenteditable')){
      j++
    }
    div_editors[index + j]?.focus();
    historyChange()
  }
  
  function historyChange(){
    setTimeout(() => {
      EditorHistory.add(arr_html)
    });
    disaptchChange()
  }

  let list_editors;
  function setListEditors(node) {
    list_editors = node;
  }

  let show_toolbar = false;

  let setClass;
  let setGClass;
  let base_node;
  let classes;
  let g_classes;
  let href;
  let blank;
  let mouseX;

  function showToolBar(evt) {
    base_node = evt.detail.base_node;
    if (!base_node || base_node.tagName == "DIV") return;
    show_toolbar = true;
    setClass = evt.detail.setClass;
    setGClass = evt.detail.setGClass;
    classes = evt.detail.classes;
    g_classes = evt.detail.g_classes;
    href = evt.detail.href;
    blank = evt.detail.blank;
    mouseX = evt.detail.mouseX;
  }

  function hideSelect() {
    show_toolbar = false;
  }

  function mergePrev(evt, i) {
    if (i > 0 && !arr_html[i-1].custom) {
      arr_html[i - 1].html += evt.detail;
      arr_html.splice(i, 1);
      arr_html[i - 1].custom = false
      arr_html = arr_html;
    }
    historyChange()
  }
  
  function mergeNext(evt, i) {
    if (i+1 < arr_html.length && !arr_html[i+1].custom) {
      arr_html[i].html += arr_html[i+1].html;
      arr_html.splice(i+1, 1);
      arr_html[i].custom = false
      arr_html = arr_html;
    }
    historyChange()
  }

  

  let setMedia 
  let delMedia 
  let show_media = false
  let img_props = {}
  function setMediaInfo(evt){
	  setMedia = evt.detail.setMedia
	  delMedia = evt.detail.delMedia
	  base_node = evt.detail.base_node
	  img_props = {
		  alt: evt.detail.alt||'',
		  src: evt.detail.src||'',
      opts: evt.detail.opts || {},
		  klass: evt.detail.klass||'',
      media_type: evt.detail.media_type
	  }
    mouseX = evt.detail.mouseX
	  // show toolbar setmedia
    setMedia(img_props)	
	  show_media = true
  }

  function addMedia(img){
    setMedia(img)
	  show_media = false
    disaptchChange()
  }

  function rmMedia(){
	  delMedia()
	  show_media = false
    disaptchChange()
  }

  function getParentEditor(target){
    while(!target.dataset.editor && target.parentNode && target.parentNode.tagName){
      target = target.parentNode
    }
    // if target found
    if(target.dataset.editor){
      return target
    }
      
    return false
  }

  function triggerChange(e){
    // trigger change if click is not on the current editor
    let pEditor = getParentEditor(e.target)
    if(!pEditor || pEditor.dataset.uid !== uid){
      triggerUpdate()
      hideSelect()
    }
  }

  let updated = false

  function contentUpdated(evt){
    if(evt?.detail?.currentTarget) {
      if(!evt.detail.currentTarget.innerText){
        // add history for first character
        EditorHistory.add(arr_html)
      }else{
        // update current history
        EditorHistory.update(arr_html)
      }
    }
    updated = true
  }
  
  function triggerUpdate(){
    if(updated && !show_toolbar){
        disaptchChange()
        EditorHistory.add(arr_html)
        updated = false
    }
  }
    
  function triggerUpdateClass(){
    historyChange()
  }
  
  function disaptchChange(){
    setTimeout(() => {
      dispatch('change', {uid, arr_html})
    });
  }
  
  function prevHistory(){
    arr_html = EditorHistory.prev()
  }
  
  function nextHistory(){
    arr_html = EditorHistory.next()
  }

  const SIMPLE_ELMS =  ['SPAN','EM','STRONG','SMALL','H1','H2','H3','H4','H5','H6','P'] // [TODO] finish this list! 

  async function pasteTxt(i, evt){
    await new Promise(r => setTimeout(r))

    let chs = evt.detail.children
    if(chs){
      let arr_h = []
      for(let ch of [...chs] ){
        if(ch.dataset?.uid?.startsWith("0x")){
          ch = ch.children[0]
          for(let child of [...ch.children]){
            arr_h.push({html: child.innerHTML, klass: child?.getAttribute('class')||''})
          }
        }else if(ch.dataset.txteditor){
            arr_h.push({html: ch.innerHTML, klass: ch.getAttribute('class')})
        }else{
        
            if(!ch.children.length){
              arr_h.push({html: ch.innerText, klass: ""})
            }
        }
      }
      if(arr_h.length){
        if(i < arr_html.length){
          arr_html = arr_html.slice(0,i).concat(arr_h).concat(arr_html.slice(i+1,arr_html.length))
        }else{
          arr_html = arr_html.slice(0,i).concat(arr_h)
        }

      }else{
        // wrap into a div or do nothing!
        if(chs.length ){
          arr_html[i].custom = true
        }
        
        if(SIMPLE_ELMS.includes(chs?.[0]?.tagName)){
          // wrap it in a div
          arr_html[i].html = `<div>${chs[0].innerHTML}</div>`
        }
      
        arr_html = arr_html

      }
      historyChange()
    }
  }

</script>

<svelte:window  on:mousedown={triggerChange} />

{#if show_toolbar && editable}
  <ToolBar
    {setGClass}
    {setClass}
    {base_node}
    {g_classes}
    {classes}
    {href}
    {blank}
    {mouseX}
    on:close={hideSelect} />
{/if}

{#if show_media && editable}
	<MediaInput setMedia={addMedia} delMedia={rmMedia} cancel={() => show_media= false} {base_node} {...img_props} {mouseX} />
{/if}

<div use:setListEditors key="ed">
  {#each arr_html as h, i}
    <ContentEditor
      on:back={prevHistory}
      on:forward={nextHistory}
      editable={editable}
      custom={!!h.custom}
      bind:html={h.html}
      bind:gklass={h.klass}
      on:enter={evt => addNewElm(i, evt)}
      on:merge_prev={evt => mergePrev(evt, i)}
      on:merge_next={evt => mergeNext(evt, i)}
      on:select={showToolBar}
      on:hideselect={hideSelect}
	    on:set_media={setMediaInfo}
      on:input={contentUpdated}
      on:changeClass={triggerUpdateClass}
      on:blur={triggerUpdate}
      on:update={triggerUpdate}
      on:pasteTxt={evt => pasteTxt(i,evt)}
	   />
  {/each}
</div>
