
<script>
	import { tick, createEventDispatcher, onMount } from 'svelte/internal';
	import Util from '../lib/Util';
	let dispatch = createEventDispatcher()

	let arr_elms = []
	
	export let html = ''
	export let gklass = ''
	export let editable = true
	export let custom = false

	async function generateArr(){
		let div = document.createElement('div')
		div.innerHTML = html
		let n_elms = []
		for(let elm of [...div.childNodes]){
			const itrue = (attr) => elm.hasAttribute(attr)
			
			if(elm.nodeName == 'BR')
				n_elms.push({tag: 'BR',txt: ""})
			else if(elm.nodeName == 'A')
				n_elms.push({tag: 'A',txt: elm.textContent, href: elm.getAttribute('href'), blank: elm.getAttribute('target')=="_blank" , klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName == 'IMG')
				n_elms.push({tag: 'IMG',txt: elm.getAttribute('alt'), href: elm.getAttribute('src'), klass: elm.classList&&[...elm.classList].join(' ')})
				else if(elm.nodeName == 'VIDEO')
				n_elms.push({tag: 'VIDEO',href: elm.getAttribute('src'), klass: elm.classList&&[...elm.classList].join(' '),
				opts: {autoplay: itrue('autoplay'), loop: itrue('loop'), muted: itrue('muted'), controls: itrue('controls')}
			})
			else if(elm.dataset?.iframe)
				n_elms.push({tag: 'IFRAME', href: elm.lastChild.getAttribute('src'), klass: elm.lastChild.classList&&[...elm.lastChild.classList].join(' ')})
			else if(elm.nodeName == 'SPAN')
				n_elms.push({txt: elm.innerText, klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName !== '#text')
				n_elms.push({htxt: `${elm.outerHTML}`, klass: elm.classList&&[...elm.classList].join(' ')})
			else if(elm.nodeName == '#text' && elm.length>0 )
				n_elms.push({txt: elm.textContent})
			
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

	$: if(editable){
		setTimeout(refreshEvents)
	}

	onMount(() => {
		mounted = true
		generateArr()
		document.onselectionchange = function() {
			window.cursor_change = +new Date
		}
	})


	// let last_position
	
	function cursorIsSame() {
		let l_cursor_change = +new Date
		return l_cursor_change - window.cursor_change > 50
	}

	
	const char_keys = ['B'.charCodeAt(0),'U'.charCodeAt(0),'I'.charCodeAt(0)]
	async function handleKeydown(e){
		
		if(e.ctrlKey && char_keys.includes(e.keyCode)){
			e.preventDefault()
			return
		}

		if(e.ctrlKey && e.keyCode == 'Z'.charCodeAt(0)){
			dispatch('back')
			return
		}

		if(e.ctrlKey && e.keyCode == 'Y'.charCodeAt(0)){
			dispatch('forward')
			return
		}

		let selection = window.getSelection()
		let b_node = selection.anchorNode
		let e_node = selection.focusNode
		let start_i = selection.baseOffset
		let end_i = selection.extentOffset
		if(!b_node) return
		let elm_node = (b_node?.tagName=='DIV') ? b_node : b_node.parentNode.tagName == 'DIV' ? b_node.parentNode : b_node.parentNode.parentNode
		let ed_elm = elm_node
		while(!ed_elm?.dataset?.txteditor && ed_elm?.tagName!='HTML'){
			ed_elm = ed_elm.parentNode
		}

		let b_index = getIndex(b_node)
		let e_index = getIndex(e_node)

		const adjustPosition = (n,d="up") => {
			let children = [...n.childNodes]
			let last_child = children[children.length-1]
			if(!last_child) return
			last_child = ['#text','BR','IMG','VIDEO'].includes(last_child.nodeName)||last_child?.dataset?.iframe ? last_child : last_child.childNodes[0] 
			if(!last_child) return false
			let pos = d == "up" ? last_child.textContent.length : 0
			try{
				selection.setBaseAndExtent(last_child,  pos, last_child, pos);
			}catch{
				// ignore!
			}
		}


		// up key
		if(e.keyCode == 38){ 
			if (b_node == e_node && start_i == 0 && (b_index <= 0)){
				// move to the previous node
				
				let pv_elm = ed_elm.previousElementSibling

				while (pv_elm && pv_elm.previousElementSibling && !pv_elm.isContentEditable) {
					pv_elm = pv_elm.previousElementSibling
				}

				if(pv_elm && pv_elm.isContentEditable){
					pv_elm.focus()
					e.preventDefault()
					adjustPosition(pv_elm, 'up')
					return false
				}
			}
			
		}
		// down key
		if(e.keyCode == 40){ 
			// get index
			if (b_node == e_node){
				
				await new Promise(r => setTimeout(r))
				// if(b_index == arr_elms.length-1 || (b_index == arr_elms.length-2 && arr_elms[arr_elms.length-1].tag == 'BR') || b_node == elm_node){				
				if((cursorIsSame() && ed_elm.dataset.txtcustom == "true") 
					|| (ed_elm.dataset.txtcustom !== "true" && b_index >= arr_elms.length-1) 
					|| ((b_index == -1 || start_i == arr_elms.length-1) && arr_elms[arr_elms.length-1].tag == 'BR')){

					let next_elm = ed_elm.nextElementSibling
					
					while (next_elm && next_elm.nextElementSibling && !next_elm.isContentEditable) {
						next_elm = next_elm.nextElementSibling
					}

					if(next_elm && next_elm.isContentEditable){
						next_elm.focus()
						e.preventDefault()
						//adjustPosition(next_elm, 'down')
						return false
					}
				}
			}
		}

		// del key
		if(e.keyCode == 46){
			if(customTxtEditor(b_node)) {
				if(b_node?.dataset?.txteditor && !b_node?.innerHTML){
					dispatch('merge_next', '')
				}
				return
			}
			let elms = arr_elms.length && arr_elms[arr_elms.length-1].tag == 'BR' ? arr_elms.slice(0,arr_elms.length-1) : arr_elms
			if((!~b_index && !elms.length) || (b_node.tagName == 'DIV' && b_index==0 && start_i == elms.length) || (b_index == elms.length-1 && start_i == elms[elms.length-1].txt?.length && !selection.toString())){
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
			if(customTxtEditor(b_node)) {
				if(b_node?.dataset?.txteditor && !b_node?.innerHTML){
					dispatch('merge_prev', '')
				}
				return
			}
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
					try{
						selection.setBaseAndExtent(l_node, l_node_end, l_node, l_node_end);
					}catch{
						// ignore!
					}
				}
			}
		}
		
		// enter key
		if(e.keyCode == 13 && e.shiftKey == false){
			let elm_html = ''
			let next_html = ''
			let elm_index = b_index==-1 ? arr_elms.length-1 : b_index+(b_node.tagName == 'DIV' && start_i>0 ?  start_i-1 : 0)

			if(customTxtEditor(b_node)) {
				e.preventDefault()
				dispatch('enter',{html: html.trim(), next_html: "", klass: gklass, target: e.currentTarget})
				return
			}

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
			
			if(customTxtEditor(div_elm)) {
				return
			}
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
						elms.push({txt: ch.textContent, klass: arr_elms[b_index]?.klass||"", tag: parent.tagName})
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

		if(!e.ctrlKey && !e.shiftKey && !e.altKey)
		dispatch('input', e)

	}

	function customTxtEditor(elm){
		if(elm?.dataset?.txtcustom) {
			return elm?.dataset?.txtcustom == "true"
		}
		if(elm?.parentNode){
			return customTxtEditor(elm.parentNode)
		}
		return false
	}

	function extractHTML(arr){
		let str = ''
		arr.forEach(elm => {
			let elm_txt = elm.txt
			if(elm.txt){
				elm_txt = elm.txt.replaceAll('<','&lt;').replaceAll('>','&gt;')
			}
			if(elm.htxt){
				str += elm.htxt
			}else if(elm.tag == 'BR'){
				str += '<br>'
			}else if(elm.tag == 'A'){
				str += `<a href=${elm.href} target=${elm.blank ? '_blank':'_self'} class="${elm.klass}">${elm_txt}</a>`
			}else if(elm.tag == 'IMG'){
				str += `<img src=${elm.href} class="${elm.klass}" alt="${elm_txt}" />`
			}else if(elm.tag == 'VIDEO'){
				str += `<video src=${elm.href} class="${elm.klass}" ${!!elm.opts?.loop ? 'loop':''} ${!!elm.opts?.autoplay ? 'autoplay':''} ${!!elm.opts?.muted ? 'muted':''} ${!!elm.opts?.controls ? 'controls':''} />`
			}else if(elm.tag == 'IFRAME'){
				let ed_str = ""
				if(editable){
					ed_str = `<div class="p-1 text-xs w-32 bg-yellow-200 text-yellow-800 cursor-pointer underline text-center">
						Edit iframe
					</div>`
				}
				str += `<div class="iframe-wrap" data-iframe="true" contenteditable="false">
					${ed_str}
					<iframe src=${elm.href} class="${elm.klass}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
				</div>`	
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

	let l_edit_state = editable
	$: if(l_edit_state != editable){
		l_edit_state = editable
		refresh()
	}

	function refreshEvents(){
		if(!edit_node) return
		[...edit_node.childNodes].forEach((ch,i) => {
			if(['IMG','VIDEO'].includes(ch.nodeName) || ch.classList?.contains('iframe-wrap')){
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
	
	 
	async function setClass(class_name,link,opts={}){
		
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

		toggleClass(up_arr, class_name,link, opts)
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

			}else if(reg_padding.test(klass)){
				let reg_padd = new RegExp(`p${klass[1]}-[^\\s]+`)
				replaceGClass(klass, reg_padd)
			}else if(reg_margin.test(klass)){
				let reg_mar = new RegExp(`m${klass[1]}-[^\\s]+`)
				replaceGClass(klass, reg_mar)
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
		dispatch('changeClass')
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

	function toggleFont(arr,klass){

		for(let elm of arr){
			if(elm.klass){
				let classes = elm.klass.split(' ')
				let s_font_index = classes.findIndex(c => reg_font.test(c))
				let selected_font_class = ~s_font_index ? classes[s_font_index] : ''
				if(selected_font_class){
					// remove old selected color
					elm.klass = elm.klass.replace(selected_font_class,'').trim()
				}
				elm.klass = elm.klass.split(' ').concat([klass]).join(' ') 
			}else{
				elm.klass = klass
			}
		}

	}


	let code_class = 'code text-sm font-mono px-8 py-6 bg-gray-100'
	let quote_class = 'quote text-xl border-l-4 border-gray-800 px-4 font-serif'



	function toggleGClass(klass){

		if(gklass.includes(klass)){
			gklass = gklass.replace(klass,'').trim()
		}else{
			gklass = gklass.split(' ').concat([klass]).join(' ')
		}
	}

	function replaceGClass(klass, reg){
		gklass = gklass.replace(reg,'').replace(/\s+/,' ').trim()
		gklass = gklass+' '+klass
	}

	
	let reg_txt_size = /md:text\-(sm\stext-sm|base\stext-base|xl\stext-lg|2xl\stext-xl|3xl\stext-xl|4xl\stext-2xl|5xl\stext-3xl|6xl\stext-4xl)/
	// duplicated, to remove!
	let g_reg_txt_size = /md:text\-(sm\stext-sm|base\stext-base|xl\stext-lg|2xl\stext-xl|3xl\stext-xl|4xl\stext-2xl|5xl\stext-3xl|6xl\stext-4xl)/
	let reg_leading = /leading\-(none|tight|snug|normal|relaxed|loose)/
	let reg_position = /text\-(left|right|center)/
	let reg_padding = /^p[lrtb]\-/
	let reg_margin = /^m[lrtb]\-/
	let reg_txt_color = /^text\-(gray|red|yellow|green|blue|indigo|purple|pink|white|black|transparent)/
	let reg_bg_color = /^bg\-(gray|red|yellow|green|blue|indigo|purple|pink|white|black|transparent)/
	const reg_font = /font\-(thin|normal|semibold|bold|black)/
	
	function toggleClass(arr, klass, link, opts={}){

		if(reg_txt_color.test(klass) || reg_bg_color.test(klass)){
			toggleColor(arr,klass)
			dispatch('changeClass')
			return
		}
		
		if(reg_font.test(klass)){
			toggleFont(arr,klass)
			dispatch('changeClass')
			return
		}

		if(arr.find(e => e.tag!='BR' && (!e.klass||!e.klass.includes(klass)))){
			for(let elm of arr){
				if(elm.tag != 'BR' && link){
						elm.tag = 'A'
						elm.href = link
						elm.blank = !!opts.blank
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
					elm.blank = !!opts.blank
				}
				if(!link && elm.tag != 'IMG' && elm.klass && elm.klass.includes('link')){
					delete elm.href
					delete elm.tag
				}
				if(!link)
					elm.klass = (elm.klass||'')&&elm.klass.replace(klass,'').trim()
				if(elm.klass == '')
					delete elm.klass
			}
		}
		dispatch('changeClass')

	}

	function splitArr(arr, a_i, s_i, e_i){

		let start = s_i
		let end = e_i||arr[a_i]?.txt?.length||arr.length+1		
		if(e_i && e_i<s_i){
			start = e_i 
			end = s_i 
		}  
		if(arr[a_i] && !arr[a_i].txt){
			return [{txt: ""},{txt: "", klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href }]
		}
		let s1 = arr[a_i]?.txt.slice(0,start)
		let s2 = arr[a_i]?.txt.slice(start,end)
		let arr1 = []
		let i = 0
		if(s1){
			arr1[i++] = {txt: s1, klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href }
		}
		if(s2){
			arr1[i++] = {txt: s2, klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href }
		}
		if(e_i && arr[a_i]?.txt.slice(end,arr[a_i].txt.length)){
			arr1[i++] = {txt: arr[a_i].txt.slice(end,arr[a_i].txt.length), klass: arr[a_i].klass, tag: arr[a_i].tag, href: arr[a_i].href}
		}
		 
		return arr1
	}
	
	// return last element if index is
	function getIndex(node){
		let p_node = node
		if(!node) return -1
		if(node.nodeName == 'DIV') {
			p_node = node.children[0]
			if(!p_node) return -1
		}
		else if(['SPAN','A'].includes(node.parentNode.tagName)){
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
		let blank = true

		for(let i=0; i<arr_slice.length;i++){
			// get all the common classes!
			let elm = arr_slice[i]
			if(elm.href){
				href = elm.href
				blank = elm.blank
				break
			}
		}
		
		return {href, blank}
	}

	
	
	function setClasses(media){
		let zmatch = media.klass.match(/z-\d+/)
		let z = zmatch?.[0] || ""
		let floatmatch = media.klass.match(/float-\w+/)
		let float = floatmatch?.[0] || ""
		if(z){
			gklass = gklass.replace(/z-\d+/,'')
		}
		if(float){
			gklass = gklass.replace(/float-\w+/,'')
		}
		gklass += ` ${z} ${float} `
		gklass = gklass.replace(/\s+/g,' ')
		media.klass = media.klass.replace(/z-\d+/,'').replace(/float-\w+/,'')
	}

	// embed image or video!
	async function embedElement(e,b_node,b_index){
		//TODO key code is not up/down/left/right
		let src = b_node.textContent.split(' ').pop()
		if(src && src.startsWith('https')){ 
			let is_img = await Util.testImgUrl(src.trim())
			let is_video = Util.testVideoUrl(src.trim())
			let iframe_vid = Util.parseYouTube(src.trim()) || Util.parseVimeo(src.trim())
			if(is_img || is_video || iframe_vid) {
				dispatch('set_media', {
					setMedia: (img) => {
						setClasses(img)
						if(is_img)
							setImg(img.klass,img.alt,src,b_index)
						else if(is_video)
							setVideo(img.klass,img.opts,src,b_index)
						else if(iframe_vid)
							setIframe(img.klass,iframe_vid,b_index)
					}, 
					media_type: is_img ? 'IMG': is_video ? 'VIDEO' : iframe_vid ? 'IFRAME' : 'AUDIO',
					base_node: b_node,
					src: iframe_vid || src,
					delMedia: () => delElm(b_index),
					mouseX
				})
			}
		}
	}

	function editMedia(b_node, i){
		let elm = arr_elms[i]
		let extra = {alt: elm?.txt||''}
		if(b_node.tagName == "VIDEO")
			extra = {opts: elm?.opts||{}}
		// if(b_node.classList?.contains('iframe-wrap')){
		// 	b_node = b_node.lastChild
		// }
		dispatch('set_media',  {
			setMedia: (img) => {
				setClasses(img)
				if(img.media_type == "VIDEO"){
					setVideo(img.klass,img.opts,img.src,i)
				}else if(img.media_type == "IMG"){
					setImg(img.klass,img.alt,img.src,i)
				}else if(img.media_type == "IFRAME"){
					setIframe(img.klass, img.src,i)
				}
			}, 
			base_node: b_node, 
			media_type: b_node.tagName,
			src: elm?.href||'', 
			klass: elm?.klass||'', 
			...extra,
			delMedia: () => delElm(i),
			mouseX
		})
	}

	function delElm(b_index){
		arr_elms.splice(b_index,1)
		refresh()
	}

	function setImg(klass,alt,src,b_index){
		gklass
		arr_elms[b_index] = {tag: 'IMG', href: src, txt: alt, klass}
		refresh()
	}
	
	function setVideo(klass,opts,src,b_index){
		arr_elms[b_index] = {tag: 'VIDEO', href: src, opts, klass}
		refresh()
	}
	
	function setIframe(klass,src,b_index){
		arr_elms[b_index] = {tag: 'IFRAME', href: src, klass}
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

		if(!b_node?.nodeName) return
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
			let {href, blank} = extractLink(b_index,e_index)
			if(customTxtEditor(b_node)) {
				return
			}
			dispatch('select',{setClass, setGClass, base_node: b_node, classes, g_classes: gklass, href, blank, mouseX})
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

	function scaleToFit(img){
		// get the scale
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		canvas.width = img.width
		canvas.height = img.height
		ctx.drawImage(img, 0,0);
		return canvas.toDataURL("image/webp");
	}

	function pasteImg(blob){
		return new Promise(resolve => {
			  if (blob !== null) {
			    let reader = new FileReader();
			    reader.onload = function(event) {
					const imgUrl = event.target.result
					const img = new Image()
					img.src = imgUrl
					img.onload = () => {
						let dataUrl = scaleToFit(img)
						html = html.replace(imgUrl, dataUrl)
					}
			      	resolve(event.target.result)

			    };
			    reader.readAsDataURL(blob);
			  }else{
			  	resolve()
			  }
		  })
	}

	function pasteContent(event){
		 
		  const items = (event.clipboardData  || event.originalEvent.clipboardData).items;
		 
		  let blob = null;
		  for (let i = 0; i < items.length; i++) {
		    if (items[i].type.indexOf("image") === 0) {
		      blob = items[i].getAsFile();
		    }
		  }
		  if(blob !== null){
			  pasteImg(blob)
		  }else{
			  let src = event.path?.[0]
			  // skib generated br
			  if(src.tagName == "BR"){
				  src = event.path?.[1]
			  }

			if(html.trim()){
				let clipboardData = event.clipboardData || window.clipboardData
				let txt = clipboardData.getData('text')
		 		event.preventDefault() 	
				const selection = window.getSelection();
				if (!selection.rangeCount) return false;
				selection.deleteFromDocument();
				selection.getRangeAt(0).insertNode(document.createTextNode(txt))
				html = contentEditorNode.innerHTML
				generateArr()
				refresh()
				dispatch('input')
			}else{
				dispatch('pasteTxt', src)
			}

			// dispatch('pasteTxt', event.srcElement)
			event.stopPropagation()
		  }
		  
	}

	function triggerUpdate(){
		dispatch('update')
	}

	let contentEditorNode

	$: ish1 = gklass.includes('text-6xl')
	$: ish2 = gklass.includes('text-5xl')
	$: ish3 = gklass.includes('text-4xl')
	$: ish4 = gklass.includes('text-3xl')
	$: ish5 = gklass.includes('text-2xl')
	$: ish6 = gklass.includes('text-xl')
</script>

<svelte:window on:mousemove={triggerUpdate} />

{#if editable}
	<div use:setEditorNode data-txtcustom={custom} bind:this={contentEditorNode} data-txteditor="true" on:paste={pasteContent} on:blur on:mousemove={setMouseX} on:mouseup|stopPropagation bind:innerHTML={html} spellcheck="false" contenteditable="true" on:keydown={handleKeydown}  class="outline-none focus:outline-none relative {gklass}" on:mouseup={fireSelect} on:keyup={fireSelect}  >
	</div>
{:else}
	{#if ish1 }
		<h1 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h1>
	{:else if ish2 }
		<h2 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h2>
	{:else if ish3 }
		<h3 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h3>
	{:else if ish4 }
		<h4 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h4>
	{:else if ish5 }
		<h5 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h5>
	{:else if ish6 }
		<h6 class="relative {gklass}" data-txteditor="true">
			{@html html}
		</h6>
	{:else if !html}
		<br>
	{:else}
		<div class="relative {gklass}" data-txteditor="true">
			{@html html.replace(/<div.*Edit iframe.*?<\/div>/gs,'')}
		</div>
	{/if}
{/if}
					  