
<script>
	import { tick, createEventDispatcher, onMount } from 'svelte/internal';
	let dispatch = createEventDispatcher()

	let arr_elms = []
	
	export let html = ''
	export let gklass = ''
	export let editable = true
	
	async function generateArr(){
		let div = document.createElement('div')
		div.innerHTML = html
		
		let n_elms = []
		for(let elm of [...div.childNodes]){
			
			if(elm.nodeName == 'BR')
				n_elms.push({tag: 'BR',txt: ""})
			else if(elm.nodeName == 'A')
				n_elms.push({tag: 'A',txt: elm.textContent, href: elm.getAttribute('href'), klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName == 'IMG')
				n_elms.push({tag: 'IMG',txt: elm.getAttribute('alt'), href: elm.getAttribute('src'), klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName !== '#text')
				n_elms.push({txt: elm.innerText, klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName == '#text' && elm.length>0 ){
				n_elms.push({txt: elm.textContent})
				
			}
		}
		
		arr_elms = n_elms
		await tick()
		refreshEvents()
	}

	// workaround in case using sapper!
	let mounted = false
	$: if(mounted){
		if(html)
			generateArr()
		else 
			arr_elms = []
	}

	onMount(() => {
		mounted = true
		generateArr()
	})
	
	const char_keys = ['B'.charCodeAt(0),'U'.charCodeAt(0),'I'.charCodeAt(0)]
	async function handleKeydown(e){
		
		if(e.ctrlKey && char_keys.includes(e.keyCode)){
			e.preventDefault()
			return
		}
		let selection = window.getSelection()
		let b_node = selection.anchorNode
		let e_node = selection.focusNode
		let start_i = selection.baseOffset
		let end_i = selection.extentOffset
		let elm_node = (b_node.tagName&&b_node.tagName=='DIV') ? b_node : b_node.parentNode.tagName == 'DIV' ? b_node.parentNode : b_node.parentNode.parentNode
		
		let b_index = getIndex(b_node)
		let e_index = getIndex(e_node)



		// up key
		if(e.keyCode == 38){ 
			if (b_node == e_node && start_i == 0 && (b_index <= 0)){
				// move to the previous node
				let pv_elm = elm_node.previousElementSibling
				// TODO - fix workaround
				// let pv_elm
				while (pv_elm && pv_elm.previousElementSibling && !pv_elm.isContentEditable) {
					pv_elm = pv_elm.previousElementSibling
				}
				// if(pv_elm && !pv_elm.isContentEditable)
				// 	pv_elm = pv_elm.previousElementSibling

				if(pv_elm && pv_elm.isContentEditable){
					pv_elm.focus()
					e.preventDefault()
					let children = [...pv_elm.childNodes]
					let last_child = children[children.length-1]
					if(!last_child) return
					last_child = last_child.nodeName == '#text'||last_child.nodeName=='BR' ? last_child : last_child.childNodes[0] 
					
					selection.setBaseAndExtent(last_child, last_child.textContent.length, last_child, last_child.textContent.length);
					return false
				}
			}
			
		}
		// down key
		if(e.keyCode == 40){ 
			// get index
			if (b_node == e_node){
				if(b_index == arr_elms.length-1 || (b_index == arr_elms.length-2 && arr_elms[arr_elms.length-1].tag == 'BR') || b_node == elm_node){
					let next_elm = elm_node.nextElementSibling
					while (next_elm && next_elm.nextElementSibling && !next_elm.isContentEditable) {
						next_elm = next_elm.nextElementSibling
					}
					// TODO - fix workaround
					// if(next_elm && !next_elm.isContentEditable)
					// 	next_elm = next_elm.nextElementSibling

					if(next_elm && next_elm.isContentEditable){
						next_elm.focus()
						e.preventDefault()
						return false
					}
				}
			}
		}

		// del key
		if(e.keyCode == 46){
			let elms = arr_elms.length && arr_elms[arr_elms.length-1].tag == 'BR' ? arr_elms.slice(0,arr_elms.length-1) : arr_elms
			if((!~b_index && !elms.length) || (b_index == elms.length-1 && start_i == elms[elms.length-1].txt.length && !selection.toString())){
				let l_node_index 
				let l_node_end 
				let pv_elm = elm_node
				if(pv_elm && pv_elm.isContentEditable){
					if(!pv_elm.childNodes.length)
						pv_elm.focus()
					else{
						l_node_index = pv_elm.childNodes.length-1
						l_node_end = pv_elm.childNodes[pv_elm.childNodes.length-1].textContent.length
					} 
				}	
				
				dispatch('merge_next')
				e.preventDefault()

				await (new Promise(r => setTimeout(r)))
				if(l_node_index !== undefined){
					let l_node = pv_elm.childNodes[l_node_index]
					if(l_node.nodeName !== '#text' && l_node.nodeName !== 'BR'){
							l_node = l_node.childNodes[0]
					}
					selection.setBaseAndExtent(l_node, l_node_end, l_node, l_node_end);
				}
				return
			}
		}

		// back key
		if(e.keyCode == 8){
			if(start_i==0 && (b_index==0 || b_index == -1)){
				let l_node_index 
				let l_node_end 
				let pv_elm = elm_node.previousElementSibling
				// STEP to skip grammarly (woraround for now!) -- TODO - fix
				if(pv_elm && !pv_elm.isContentEditable)
					pv_elm = pv_elm.previousElementSibling
				
				if(pv_elm && pv_elm.isContentEditable){
					if(!pv_elm.childNodes.length){
						pv_elm.focus()
					}
					else{
						l_node_index = pv_elm.childNodes.length-1
						l_node_end = pv_elm.childNodes[pv_elm.childNodes.length-1].textContent.length
					} 
				}	
				e.preventDefault()
				dispatch('merge_prev', html)
				await (new Promise(r => setTimeout(r)))
				if(l_node_index !== undefined){
					let l_node = pv_elm.childNodes[l_node_index]
					if(l_node.nodeName !== '#text' && l_node.nodeName !== 'BR'){
							l_node = l_node.childNodes[0]
					}
					selection.setBaseAndExtent(l_node, l_node_end, l_node, l_node_end);
				}
			}
		}
		
		// enter key
		if(e.keyCode == 13 && e.shiftKey == false){
			let elm_html = ''
			let next_html = ''
			let elm_index = b_index==-1 ? arr_elms.length-1 : b_index
			if(arr_elms.length>0 && ~b_index){
				
				let n_arr = splitArr(arr_elms,elm_index,start_i)
				arr_elms.splice(elm_index,1,...n_arr)
				
				let s_index = elm_index+(start_i==0 ? 0 :1)
				elm_html = extractHTML(arr_elms.slice(0, s_index))
				next_html = extractHTML(arr_elms.slice(s_index, arr_elms.length))
			}
			if(!~b_index){
				elm_html = extractHTML(arr_elms)
			}
			dispatch('enter',{html: elm_html.trim(), next_html: next_html.trim(), klass: gklass, target: e.currentTarget})
			e.preventDefault()
			return false
		}

		if(e.keyCode == 13 && e.shiftKey == true){
			
			let div_elm = b_node.nodeName != '#text' ? b_node.parentNode : b_node.parentNode.parentNode
			await (new Promise(r => setTimeout(r)))
			
			// not in rooot
			if(b_node.nodeName != "DIV" &&  ((b_node.parentNode && b_node.parentNode.tagName != 'DIV') || !['BR','#text'].includes(b_node.nodeName))){
				let parent = b_node.nodeName != '#text' ? b_node : b_node.parentNode
				//div_elm = parent.parentNode ? parent.parentNode : div_elm
				if(!parent.parentNode) {
					refresh()
					await (new Promise(r => setTimeout(r)))
					let p_elm = div_elm.childNodes[b_index]
					selection.setBaseAndExtent(p_elm, 0, p_elm, 0);
					return
				}
				// parent child text nodes
				let children = [...parent.childNodes]
				let elms = []
				
				for (let ch of children){
					if(ch && ch.textContent){
						elms.push({txt: ch.textContent, klass: arr_elms[b_index].klass, tag: parent.tagName})
					}else{
						elms.push({tag: "BR", txt: ""})
					}
				}

				arr_elms.splice(b_index, 1,...elms)
				refresh()
				await (new Promise(r => setTimeout(r)))
				
				let p_elm = div_elm.childNodes[elms[0].tag == 'BR' ? b_index: b_index+2]
				selection.setBaseAndExtent(p_elm, 0, p_elm, 0);
			}


		}

	}

	function extractHTML(arr){
		let str = ''
		arr.forEach(elm => {
			let elm_txt = elm.txt
			if(elm.txt){
				elm_txt = elm.txt.replaceAll('<','&lt;').replaceAll('>','&gt;')
			}
			if(elm.tag == 'BR'){
				str += '<br>'
			}else if(elm.tag == 'A'){
				str += `<a href=${elm.href} target='_blank' class="${elm.klass}">${elm_txt}</a>`
			}else if(elm.tag == 'IMG'){
				str += `<img src=${elm.href} class="${elm.klass}" alt=${elm_txt} />`
			}else if(elm.klass){
				str += `<span class="${elm.klass}">${elm_txt}</span>`
			}else{
				str += elm_txt
			}
		})
		return str
	}

	function refresh(){	
		html = extractHTML(arr_elms)
	}

	function refreshEvents(){
		if(!edit_node) return
		[...edit_node.childNodes].forEach((ch,i) => {
			if(ch.nodeName == 'IMG'){
				ch.addEventListener('click', (e)=> editMedia(e.currentTarget,i))
			}
		})
	}

	let h_selection = null

	async function holdSelection(selection){
		if(h_selection) return
		h_selection = {
			start_i: selection.baseOffset ,
			end_i: selection.extentOffset ,
			
			b_node: selection.anchorNode,
			e_node: selection.focusNode
		}
	}
	
	 
	async function setClass(class_name,link){
		
		arr_elms.forEach(e => delete e.selected)
		let selection = window.getSelection() 
		let selection_txt = selection.toString()

		let	start_i = h_selection ? h_selection.start_i : selection.baseOffset 
		let end_i = h_selection ? h_selection.end_i : selection.extentOffset 
		
		let b_node = h_selection ? h_selection.b_node : selection.anchorNode
		let e_node = h_selection ? h_selection.e_node : selection.focusNode
		
		let b_index = getIndex(b_node)
		let e_index = getIndex(e_node)
		
		let same_node = b_node == e_node 
		 
		let reverse = b_index > e_index
		
		let sb_index = b_index
		let se_index = e_index
		if(reverse){
			sb_index = e_index
			se_index = b_index
			let x = start_i
			start_i = end_i
			end_i = x
		}
		
		let edit_node = b_node.parentNode
		if(b_node.parentNode.tagName !== 'DIV'){
			edit_node = edit_node.parentNode
		}
		
		let n_arr  = arr_elms.slice(sb_index,se_index+1)
			
		let arr1 = splitArr(n_arr,0,start_i, same_node && end_i)
		 
		let up_arr = arr1.length == 1 ? arr1 : arr1.length == 2&&(start_i==0||end_i==0) ? [arr1[0]] : [arr1[1]] 
		
		n_arr.splice(0,1,...arr1)
		let arr2 = []
		if(!same_node){
			arr2 = splitArr(n_arr,n_arr.length-1, end_i, false) 
			n_arr.splice(n_arr.length-1,1,...arr2)
			up_arr = up_arr.concat(n_arr.slice(1,n_arr.length-(arr2.length == 1 ? 0:1)))  
		}

		toggleClass(up_arr, class_name,link)
		up_arr.forEach(e => e.selected= true)
		
		arr_elms.splice(sb_index,se_index-sb_index+1,...n_arr)

		let p_selector = {}
		mergeArr(p_selector)
		
		refresh()

		h_selection = null 

		await tick()

		let ch_nodes = [...edit_node.childNodes].filter(elm => elm.nodeName !== '#text' || (elm.nodeName == '#text' && elm.length>0))
		
		let start_node = ch_nodes[p_selector.a_start]
		let end_node = ch_nodes[p_selector.a_end]
		start_node = start_node.nodeName == '#text' ? start_node : start_node.firstChild
		end_node = end_node.nodeName == '#text' ? end_node : end_node.firstChild

		await (new Promise(r => setTimeout(r)))
		
		window.getSelection().removeAllRanges();
		window.getSelection().setBaseAndExtent(start_node, p_selector.s_start, end_node, p_selector.s_end);
		
		holdSelection(window.getSelection())

		
	} 
	

	async function setGClass(klass){
		
		if(klass){
			if(reg_txt_size.test(klass)){
				
				gklass = gklass.replace(code_class,'').replace(quote_class,'').trim()
				replaceGClass(klass, reg_txt_size)

			}else if( klass.startsWith('code')){

				if(!gklass.includes(code_class)){
					gklass = gklass.replace(quote_class,'').replace(g_reg_txt_size,'').trim()
					gklass +=  ' '+code_class
				}
			
			}else if( klass.startsWith('quote')){

				if(!gklass.includes(quote_class)){
					gklass = gklass.replace(code_class,'').replace(g_reg_txt_size,'').trim()
					gklass +=  ' '+quote_class
				}

			}else if (reg_position.test(klass)){
				replaceGClass(klass, reg_position)
			}else if (reg_leading.test(klass)){
				replaceGClass(klass, reg_leading)
			}else {
				toggleGClass(klass)
			} 
			 
		}else{
			elm.klass = klass
		}
		dispatch('input')
	}
	
	function mergeArr(p_selector){
		let n_arr = [{...arr_elms[0]}]
		
		if(arr_elms[0].selected){
			p_selector.s_start = 0
			p_selector.a_start = 0
			p_selector.s_end = arr_elms[0].txt.length
			p_selector.a_end = 0
		}
		
		for(let i=1; i<arr_elms.length;i++){

				if(arr_elms[i].txt && arr_elms[i].tag == arr_elms[i-1].tag && arr_elms[i].klass == arr_elms[i-1].klass){
					
					if(arr_elms[i].selected && !arr_elms[i-1].selected){
						p_selector.s_start = n_arr[n_arr.length-1].txt.length
						p_selector.a_start = n_arr.length-1
						p_selector.s_end = n_arr[n_arr.length-1].txt.length+arr_elms[i].txt.length
						p_selector.a_end = n_arr.length-1
					}
				  
					n_arr[n_arr.length-1].txt += arr_elms[i].txt 
					

				}else{
					if(arr_elms[i].txt){
						n_arr.push({...arr_elms[i]})
						
						if(arr_elms[i].selected && !arr_elms[i-1].selected){
							p_selector.s_start = 0
							p_selector.a_start = n_arr.length-1
							p_selector.s_end = n_arr[n_arr.length-1].txt.length
							p_selector.a_end = n_arr.length-1
						}
						
					}else if(arr_elms[i].tag == 'BR'){
						n_arr.push({...arr_elms[i]})
					}
				}
				
				if(arr_elms[i].selected && arr_elms[i-1].selected){
					p_selector.s_end = n_arr[n_arr.length-1].txt.length
					p_selector.a_end = n_arr.length-1
				}
			
		}
		
		arr_elms = n_arr
	}

	function toggleColor(arr,klass){

		for(let elm of arr){
			if(elm.klass){
				let classes = elm.klass.split(' ')
				let s_color_index = classes.findIndex(c => klass.startsWith('text') ? reg_txt_color.test(c) : reg_bg_color.test(c))
				let selected_color_class = ~s_color_index ? classes[s_color_index] : ''
				if(selected_color_class){
					// remove old selected color
					elm.klass = elm.klass.replace(selected_color_class,'').trim()
				}
				elm.klass = elm.klass.split(' ').concat([klass]).join(' ') 
			}else{
				elm.klass = klass
			}
		}

	}


	let code_class = 'code text-sm font-mono px-8 py-6 bg-gray-200'
	let quote_class = 'quote text-xl border-l-4 border-gray-800 px-4 font-serif'



	function toggleGClass(klass){

		if(gklass.includes(klass)){
			gklass = gklass.replace(klass,'').trim()
		}else{
			gklass = gklass.split(' ').concat([klass]).join(' ')
		}
	}

	function replaceGClass(klass, reg){
		
		let classes = gklass.split(' ')
		let s_index = classes.findIndex(c => reg.test(c))
		let selected_class = ~s_index ? classes[s_index] : ''
		if(selected_class){
			gklass = gklass.replace(selected_class,'').trim()
		}
		gklass = gklass.split(' ').concat([klass]).join(' ')

	}

	
	let reg_txt_size = /^text\-(sm|base|xl|3xl|4xl)/
	let g_reg_txt_size = /text\-(sm|base|xl|3xl|4xl)/
	let reg_leading = /^leading\-(none|tight|snug|normal|relaxed|loose)/
	let reg_position = /^text\-(left|right|center)/
	let reg_txt_color = /^text\-(gray|red|yellow|green|blue|indigo|purple|pink|white|black|transparent)/
	let reg_bg_color = /^bg\-(gray|red|yellow|green|blue|indigo|purple|pink|white|black|transparent)/
	
	function toggleClass(arr, klass, link){

		if(reg_txt_color.test(klass) || reg_bg_color.test(klass)){
			toggleColor(arr,klass)
			dispatch('input')
			return
		}

		if(arr.find(e => e.tag!='BR' && (!e.klass||!e.klass.includes(klass)))){
			for(let elm of arr){
				if(elm.tag != 'BR' && link){
						elm.tag = 'A'
						elm.href = link
				}
				
				if(!elm.klass || !elm.klass.includes(klass)){
					elm.klass = elm.klass ? elm.klass.split(' ').concat([klass]).join(' ') : klass
					elm.tag = elm.tag
				}
			}
		}else{
			for(let elm of arr){
				if(elm.tag != "BR" && link){
					elm.tag = 'A'
					elm.href = link
				}
				if(!link && elm.tag != 'IMG' && elm.klass && elm.klass.includes('link')){
					delete elm.href
					delete elm.tag
				}
				elm.klass = (elm.klass||'')&&elm.klass.replace(klass,'').trim()
				if(elm.klass == '')
					delete elm.klass
			}
		}
		dispatch('input')

	}

	function splitArr(arr, a_i, s_i, e_i){

		let start = s_i
		let end = e_i||arr[a_i].txt.length
		if(e_i && e_i<s_i){
			start = e_i 
			end = s_i 
		}  
		let s1 = arr[a_i].txt.slice(0,start)
		let s2 = arr[a_i].txt.slice(start,end)
		let arr1 = []
		let i = 0
		if(s1){
			arr1[i++] = {txt: s1, klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href }
		}
		if(s2){
			arr1[i++] = {txt: s2, klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href }
		}
		if(e_i && arr[a_i].txt.slice(end,arr[a_i].txt.length)){
			arr1[i++] = {txt: arr[a_i].txt.slice(end,arr[a_i].txt.length), klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href}
		}
		 
		return arr1
	}
	
	// return last element if index is
	function getIndex(node){
		let p_node = node
		if(!node || node.nodeName == 'DIV') return -1
		if(['SPAN','A'].includes(node.parentNode.tagName)){
			p_node = node.parentNode
		}
		return [...p_node.parentNode.childNodes].filter(n => n.nodeName!='#text' || n.length>0).indexOf(p_node)
		
	}
	
	// EVENT FN
	
	function extractClasses(b_index,e_index){
		if(b_index > e_index){
			let x = b_index
			b_index = e_index 
			e_index =  x 
		}
		let arr_slice = arr_elms.slice(b_index,e_index+1)
		if(!arr_slice[0] || !arr_slice[0].klass) 
			return ''

		let b_class = arr_slice[0].klass
		// find similar classes
		let arr_classes = b_class.split(' ')
		// if word not found remove it
		for(let i=1; i<arr_slice.length;i++){
			// get all the common classes!
			let elm = arr_slice[i]
			for(let w_class of arr_classes){
				if(elm.klass && !elm.klass.includes(w_class)){
					b_class = b_class.replace(w_class,'').trim()
				}
			}
		}
		return b_class
	}

	function extractLink(b_index,e_index){
		if(b_index > e_index){
			let x = b_index
			b_index = e_index 
			e_index =  x 
		}
		let arr_slice = arr_elms.slice(b_index,e_index+1)
		
		let href = ''

		for(let i=0; i<arr_slice.length;i++){
			// get all the common classes!
			let elm = arr_slice[i]
			if(elm.href){
				href = elm.href
				break
			}
		}
		
		return href
	}
	
	// embed image or video!
	function embedElement(e,b_node,b_index){
		//TODO key code is not up/down/left/right
		let src = b_node.textContent.split(' ').pop()
		if(src && /^https?:\/\/.*\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(src.trim())){
			dispatch('set_media', {setMedia: (img) => setImg(img.klass,img.alt,src,b_index), base_node: b_node})
		}
	}

	function updateMedia(){
		console.log("Update media !!! ")
	}

	function editMedia(b_node, i){
		let elm = arr_elms[i]
		dispatch('set_media',  {setMedia: (img) => setImg(img.klass,img.alt,img.src,i), base_node: b_node, src: elm.href, klass: elm.klass, alt: elm.txt})
	}

	function setImg(klass,alt,src,b_index){
		arr_elms[b_index] = {tag: 'IMG', href: src, txt: alt, klass}
		refresh()
	}
	
	let mouseX
	function setMouseX(e){
		mouseX = e.clientX
	} 

	let l_selected = ''
	function fireSelect(e){
		
		 
		let selection = window.getSelection() 
		let selection_txt = selection.toString()
		let b_node = selection.anchorNode
		let e_node = selection.focusNode
		let b_index = getIndex(b_node)
		let e_index = getIndex(e_node)

		if(b_node.nodeName == 'DIV' || e_node.nodeName == 'DIV'){
			hideSelect()
			return
		}
		h_selection = null
		if(selection_txt){				
			let base_node = b_index < e_index ? b_node : e_node
			holdSelection(selection)
			// extract classes to pass them to the toolbar!
			let classes = extractClasses(b_index,e_index)
			let href = extractLink(b_index,e_index)
			dispatch('select',{setClass, setGClass, base_node: b_node, classes, g_classes: gklass, href, mouseX})
		}else{
			embedElement(e,b_node,b_index)
			hideSelect()

		}
		l_selected = selection_txt

	}
	
	function hideSelect(){
		dispatch('hideselect')
	}

	let edit_node 
	function setEditorNode(node){
		edit_node = node
	}
</script>

<style>
	div[contenteditable][placeholder]:empty:before {
		content: attr(placeholder);
		position: absolute;
		color: #cbd5e0;
		background-color: transparent;
	}
</style>
{#if editable}
	<div use:setEditorNode data-txteditor="true" on:input on:blur on:mousemove={setMouseX} on:mouseup|stopPropagation bind:innerHTML={html} placeholder='' spellcheck="false" contenteditable="true" on:keydown={handleKeydown}  class="outline-none focus:outline-none relative {gklass}" on:mouseup={fireSelect} on:keyup={fireSelect}  >
	</div>
{:else}
	<div class="relative {gklass}" data-txteditor="true">
		{@html html}
	</div>
{/if}
					  