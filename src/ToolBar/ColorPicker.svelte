<script>
	import ColorList from './ColorList.svelte'
	import DownIcon from '../Icons/DownIcon.svelte'
	
	export let txt = 'text'
	export let setClass
	// get color from klass
	export let klass

	$: posKlass = lNode?.getBoundingClientRect()?.bottom > window.innerHeight ? 'bottom-0 mb-8' : 'mt-8 top-0' 

	let lNode

	let colors = [
		'gray','red','yellow','green','blue','indigo','purple','pink'
	]
	let show_colors = false
	let selected_color = 'blue-500'

	$: if(klass){
		let classes = klass.split(' ')
		let reg = new RegExp(txt+'\\-('+colors.join('|')+')')
		let s_color_index = classes.findIndex(c => reg.test(c))
		selected_color = ~s_color_index ? classes[s_color_index].replace(txt+'-','') : ''
	}


	function selectColor(evt){
		setClass(txt+"-"+evt.detail)		
		selected_color = evt.detail
	}

	function showColors(e){
		show_colors = !show_colors
		e.stopPropagation()
		e.preventDefault()
	}
	
	function hideColors(){
		show_colors= false
	}
</script>

<svelte:window on:click={hideColors} />
<div class="flex relative">	
	<div class="font-medium flex items-center cursor-pointer {txt}-{selected_color} px-1" on:click={showColors}>
		<span class="">A</span> <DownIcon />
	</div>
	{#if show_colors}
		<div class="absolute left-0 {posKlass} z-920 bg-white" bind:this={lNode}>	
			<ColorList selected_color={selected_color} on:select={selectColor} />
		</div>
	{/if}
</div>