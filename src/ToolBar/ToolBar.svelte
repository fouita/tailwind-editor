<script>				
	import { createEventDispatcher} from 'svelte/internal'

	import ColorPicker from './ColorPicker.svelte'
	import CodeIcon from '../Icons/CodeIcon.svelte'
	
	import LinkInput from './LinkInput.svelte'
	import JustifyIcon from '../Icons/JustifyIcon.svelte'
	import Leading from './Leading.svelte'
	import HeadingList from './HeadingList.svelte'
	import TextAlign from './TextAlign.svelte';
	import {STYLE} from './const'
	import Spacing from './Spacing.svelte';
	
	export let setClass
	export let setGClass
	export let classes
	export let g_classes
	export let href
	export let blank
	// export let setLink
	export let base_node
	let dispatch = createEventDispatcher()
	export let mouseX
	
	function firstParentRelative(n){
		// Make element absolute if you want to restore this
		// while(n.parentNode && n.parentNode.tagName){
		// 	n = n.parentNode
		// 	if(window.getComputedStyle(n).getPropertyValue('position').toLowerCase() == 'relative'){
		// 		return n.getBoundingClientRect()
		// 	}
		// }
		// return {top: -window.scrollY, left: 0}
		return {top: 0, left: 0}
	}

	function setPosition(node){
		let e = window.event;
		if(!base_node) return
		
		let elm = base_node.parentNode.tagName == 'DIV' ? base_node : base_node.parentNode
		let rect = elm.parentNode.getBoundingClientRect()
		let posY = rect.top-10; 
		if(elm.previousElementSibling){
			let ch_nodes = [...elm.parentNode.childNodes]
			let siblings = ch_nodes.slice(0,ch_nodes.indexOf(elm)+1)
			let br = siblings.reverse().find(elm => elm.tagName == 'BR')
			if(br){
				rect = br.getBoundingClientRect()
				posY = rect.top ? rect.top : posY
			}
		}

		let rel_rect = firstParentRelative(node)
		let pos_top = posY-rel_rect.top
		if(posY<30)
			pos_top = 30
		node.style.top = `${pos_top}px`
		mouseX = mouseX || 10
		let mx = mouseX-node.offsetWidth/2 
		mx = mx > 0 ? mx : 10
		mx = mouseX+node.offsetWidth/2 < window.innerWidth ? mx : window.innerWidth-node.offsetWidth
		node.style.left = `${mx-rel_rect.left}px`
	}

	function close(){
		dispatch('close')
	}

	function cexist(klass){
		return classes.includes(klass)
	}
	function cgexist(klass){
		return g_classes.includes(klass)
	}
	function cregexist(reg){
		return reg.test(classes)
	}

	

	let e_classes = {}

	const reg_font = /font\-(thin|normal|semibold|bold|black)/

	function initEClasses(){
		e_classes = {
			bold: cregexist(reg_font),
			italic: cexist(STYLE.ITALIC),
			underline: cexist(STYLE.UNDERLINE),
			linethrough: cexist(STYLE.LINETHROUGH),
			code: cexist(STYLE.CODE),
			link: cexist(STYLE.LINK),
			justify: cgexist(STYLE.JUSTIFY),
			center: cgexist(STYLE.CENTER),
			left: cgexist(STYLE.LEFT),
			right: cgexist(STYLE.RIGHT),
		}
	}
	initEClasses()

	function toggle(klass){
		setClass(klass)
		if(!classes.includes(klass)){
			classes = classes.split(' ').concat([klass]).join(' ')
		}else{
			let n_classes  = classes.split(' ')
			n_classes.splice(n_classes.indexOf(klass),1)
			classes = n_classes.join(' ')
		}
		
		initEClasses()
	}

	function toggleBold(){
		const fonts = ['thin','normal','semibold','bold','black']
		let included = false
		for(let i=0; i< fonts.length;i++){
			if(classes.includes(fonts[i])){
				included = true
				if(i+1<fonts.length){
					classes = classes.replace('font-'+fonts[i],'font-'+fonts[i+1]).trim()
					setClass('font-'+fonts[i+1])
				}else{
					classes = classes.replace('font-'+fonts[i],'font-'+fonts[0]).trim()
					setClass('font-'+fonts[0])
				}
				break;
			}
		}
		if(!included){
			classes = classes.split(' ').concat(['font-bold']).join(' ').trim()
			setClass('font-bold')
		}
		initEClasses()
	}
	
	
	// duplicated in contenteditor (TO UPDATE!)
	function replaceGClass(klass, reg, gklass){
		let classes = gklass.split(' ')
		let s_index = classes.findIndex(c => reg.test(c))
		// console.log({classes})
		// console.log({reg})
		// console.log({s_index})
		let selected_class = ~s_index ? classes[s_index] : ''
		// console.log({selected_class})
		if(selected_class){
			gklass = gklass.replace(selected_class,'').trim()
			// console.log({gklass})
		}
		gklass = gklass.split(' ').concat([klass]).join(' ')
		// console.log({gklass})

		
		return gklass
	}

	// duplicated!! 
	const reg_position = /^text\-(left|right|center)/
	const reg_padding = /^p[lrtb]\-/
	const reg_margin = /^m[lrtb]\-/


	function toggleG(klass){
		setGClass(klass)
		if(reg_position.test(klass)){
			g_classes = replaceGClass(klass,reg_position,g_classes)

		}else if(reg_padding.test(klass)){
			let reg_padd = new RegExp(`^p${klass[1]}`)
			g_classes = replaceGClass(klass,reg_padd,g_classes)

		}else if(reg_margin.test(klass)){
			let reg_mar = new RegExp(`^m${klass[1]}`)
			g_classes = replaceGClass(klass,reg_mar,g_classes)

		}else if(!g_classes.includes(klass)){
			g_classes = g_classes.split(' ').concat([klass]).join(' ')
		}else{
			let n_classes  = g_classes.split(' ')
			n_classes.splice(n_classes.indexOf(klass),1)
			g_classes = n_classes.join(' ')
		}
		
		initEClasses()
	}
	
</script>

<div use:setPosition on:mousedown|stopPropagation class="flex fixed font-normal -mt-6 shadow bg-white z-950 text-base rounded">	
	<div class="rounded flex items-center shadow-lg border border-gray-200  text-gray-700">
			<div class="border-r">
				<HeadingList setClass={setGClass} klass={g_classes} />	
			</div>
			<div class="px-2 cursor-pointer select-none { e_classes.bold ? 'text-blue-600':''} font-medium hover:bg-gray-200 py-1" on:mousedown={toggleBold}>
				B
			</div>
			<div class="px-3 cursor-pointer select-none { e_classes.italic ? 'text-blue-600':''} italic hover:bg-gray-200 py-1" on:mousedown={() => toggle(STYLE.ITALIC)}>
				i
			</div>
			<div class="px-2 cursor-pointer select-none { e_classes.underline ? 'text-blue-600':''} underline hover:bg-gray-200 py-1" on:mousedown={() => toggle(STYLE.UNDERLINE)}>
				U
			</div>
			<div class="px-2 cursor-pointer select-none { e_classes.linethrough ? 'text-blue-600':''} line-through hover:bg-gray-200 py-1" on:mousedown={() => toggle(STYLE.LINETHROUGH)}>
				S
			</div>
			<div class="px-2 cursor-pointer select-none { e_classes.code ? 'text-blue-600':''} line-through hover:bg-gray-200 py-2" on:mousedown={() => toggle(STYLE.CODE)}>
				<CodeIcon />
			</div>
			<div class="{ e_classes.link ? 'text-blue-600':''} cursor-pointer select-none hover:bg-gray-200 text-sm border-r">
				<LinkInput setLink={setClass} on:close={close} {href} {blank} />
			</div>
			
			<div class="pl-1 cursor-pointer select-none hover:bg-gray-200 py-1 ">
				<ColorPicker {setClass} klass={classes} />
			</div>
			<div class="px-1 cursor-pointer select-none hover:bg-gray-200 border-r h-full flex items-center">
				<ColorPicker txt="bg" {setClass} klass={classes} />
			</div>
		
			<div class="px-2 { e_classes.justify ? 'text-blue-600':'text-gray-700'} cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center" on:mousedown={() => toggleG(STYLE.JUSTIFY)}>
				<JustifyIcon />
			</div>
			
			<TextAlign {e_classes} on:select={(evt) => toggleG(evt.detail)} />
			
			<div class="border-l h-full">
				<Spacing mp="p" title="Padding" {g_classes} on:select={(evt) => toggleG(evt.detail)} />
			</div>

			<div class="h-full">
				<Spacing mp="m" title="Margin" {g_classes} on:select={(evt) => toggleG(evt.detail)} />
			</div>
			
			<div class="cursor-pointer select-none hover:bg-gray-200 h-full flex items-center border-l">
				<Leading setClass={setGClass} klass={g_classes} />
			</div>
			
			
	</div>
</div>


