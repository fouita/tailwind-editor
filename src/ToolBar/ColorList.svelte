
<script>
	import NoColor from '../Icons/NoColor.svelte'
	import {createEventDispatcher} from 'svelte/internal'

	let dispatch = createEventDispatcher()
	export let selected_color = ''
	let colors = [
		'gray','red','yellow','green','blue','indigo','purple','pink'
	]
	
	function selectColor(e,color){
		selected_color = color
		dispatch('select',color)
		e.preventDefault()
		e.stopPropagation()
	}
</script>

<div class="flex">	
	<div class="shadow-xl border border-gray-200">
		<div class="flex items-center">
			<div class="bg-black  w-5 h-5 cursor-pointer" on:click={(e) => selectColor(e,`black`)}>
			</div>
			<div class="bg-white border border-gray-400 w-5 h-5 cursor-pointer" on:click={(e) => selectColor(e,`white`)}>
			</div>
			<div class="bg-white border-t border-b border-r border-gray-400 w-5 h-5 flex items-center justify-center cursor-pointer" on:click={(e) => selectColor(e,`transparent`)}>
				<NoColor />
			</div>
		</div>
		{#each (new Array(8)) as num,i}
			<div class="flex">
				{#each colors as color}
					<div class="bg-{color}-{(i+1)*100} w-5 h-5 cursor-pointer" on:click={(e) => selectColor(e,`${color}-${(i+1)*100}`)}>
					</div>

				{/each}
			</div>
		{/each}
	</div>
</div>