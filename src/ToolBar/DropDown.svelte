<script>
	// import {createEventDispatcher} from 'svelte/internal'
	import List from './List.svelte'
	let klass = ''
	export let open = false
	export {klass as class}
	export let selected
	// let dispatch = createEventDispatcher()

	export let list = [
		{
			label:'none',
			value:'none'
		},
		{
			label:'tight',
			value:'tight'
		},
		{
			label:'snug',
			value:'snug'
		},
		{
			label:'normal',
			value:'normal'
		},
		{
			label:'relaxed',
			value:'relaxed'
		},
		{
			label:'loose',
			value:'loose'
		}
	]

	function toggleList(e){
		open= !open
		e.preventDefault()
		e.stopPropagation()
	}
	
	function hideList(){
		open = false
	}
	
</script>

<svelte:window on:click={hideList} />
<div class="relative">
	<div class="cursor-pointer flex h-full" on:click={toggleList}>
		<slot>Click To show</slot>
	</div>
	{#if open}
	<div class="absolute -ml-1 z-920 {klass}">
		<List {list} {selected} on:select />
	</div>
	{/if}
</div>