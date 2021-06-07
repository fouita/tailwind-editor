<script>
  import ContentEditor from "./ContentEditor.svelte";
  import ToolBar from "../ToolBar/ToolBar.svelte";
  import MediaInput from "../ToolBar/MediaInput.svelte";
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
  async function addNewElm(i, evt) {
    // split
    // get element index
    let target = evt.detail.target
    let index = [...target.parentNode.children].indexOf(target)
    arr_html.splice(
      i,
      1,
      { html: evt.detail.html, klass: evt.detail.klass },
      { html: evt.detail.next_html, klass: evt.detail.klass }
    );
    // auto focus
    arr_html = arr_html;
	  await new Promise(r => setTimeout(r));
	  // find next div index in cildren
	  let div_editors = [...list_editors.children].filter(e => e.tagName == 'DIV')
    // next element
    let j= 1;
    while(!div_editors[index + j].getAttribute('contenteditable')){
      j++
    }
    div_editors[index + j].focus();

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
    mouseX = evt.detail.mouseX;
  }

  function hideSelect() {
    show_toolbar = false;
  }

  function mergePrev(evt, i) {
    if (i > 0) {
      arr_html[i - 1].html += evt.detail;
      arr_html.splice(i, 1);
      arr_html = arr_html;
    }
  }
  
  function mergeNext(evt, i) {
    if (i+1 < arr_html.length) {
      arr_html[i].html += arr_html[i+1].html;
      arr_html.splice(i+1, 1);
      arr_html = arr_html;
    }
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

  function contentUpdated(){
    updated = true
  }
  
  function triggerUpdate(){
    if(updated && !show_toolbar){
        disaptchChange()
        updated = false
    }
  }

  function disaptchChange(){
      dispatch('change', {uid, arr_html})
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
    {mouseX}
    on:close={hideSelect} />
{/if}

{#if show_media && editable}
	<MediaInput setMedia={addMedia} delMedia={rmMedia} cancel={() => show_media= false} {base_node} {...img_props} {mouseX} />
{/if}

<div use:setListEditors>
  {#each arr_html as h, i}
    <ContentEditor
      editable={editable}
      bind:html={h.html}
      bind:gklass={h.klass}
      on:enter={evt => addNewElm(i, evt)}
      on:merge_prev={evt => mergePrev(evt, i)}
      on:merge_next={evt => mergeNext(evt, i)}
      on:select={showToolBar}
      on:hideselect={hideSelect}
	    on:set_media={setMediaInfo}
      on:input={contentUpdated}
      on:blur={triggerUpdate}
	   />
  {/each}
</div>
