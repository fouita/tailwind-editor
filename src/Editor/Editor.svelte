
<script>
	import ContentEditor from './ContentEditor.svelte'
	import ToolBar from '../ToolBar/ToolBar.svelte'
	import { tick } from 'svelte/internal';		

	export let arr_html = [
		{html:``, klass:'p-2'}
	]
	
	export let html = ''
	
	$: html = arr_html.map(h => `<div class='${h.klass}'>${h.html}</div>`).join('\n')
	async function addNewElm(i,evt){
		
		// split 
		arr_html.splice(i,1,
			{html: evt.detail.html,klass: evt.detail.klass},
			{html: evt.detail.next_html,klass: evt.detail.klass},
		)
		// auto focus
		arr_html = arr_html
		await (new Promise(r => setTimeout(r)))
		list_editors.children[i+1].focus()
		
	}
	
	let list_editors
	function setListEditors(node){
		list_editors = node
	}
	
	let show_toolbar = false
	
	let setClass
	let setGClass
	let base_node
	let classes
	let g_classes
	let href

	function showToolBar(evt){
		base_node =  evt.detail.base_node
		if(!base_node || base_node.tagName == 'DIV') 
			return
		show_toolbar =  true
		setClass =  evt.detail.setClass
		setGClass =  evt.detail.setGClass
		classes =  evt.detail.classes
		g_classes =  evt.detail.g_classes
		href =  evt.detail.href
	}
	
	function hideSelect(){	
		show_toolbar=false
	}

	function mergePrev(evt,i){
		if(i>0){
			arr_html[i-1].html += evt.detail  
			arr_html.splice(i,1)
			arr_html = arr_html
		}
	}
	
</script>

{#if show_toolbar}
	<ToolBar {setGClass} {setClass} {base_node} {g_classes} {classes} {href} on:close={hideSelect} />
{/if}

<div use:setListEditors>
	{#each arr_html as h,i}
		<ContentEditor bind:html={h.html} bind:gklass={h.klass} on:enter={(evt) => addNewElm(i,evt)} on:merge_prev={evt => mergePrev(evt,i)} on:select={showToolBar} on:hideselect={hideSelect} />
	{/each}
</div>


					  