<script>
	import CheckIcon from '../Icons/CheckIcon.svelte'
	import {createEventDispatcher} from 'svelte/internal'
	let dispatch = createEventDispatcher()
	export let list = []
	export let selected
	
	function select(e,val){
		selected = val
		dispatch('select',selected)
		e.stopPropagation()
		e.preventDefault()
	}
</script>

<div class="shadow-xl border-r border-l rounded mt-1 bg-white">	
	{#each list as elm}
		<div class="px-2 py-1 flex items-center hover:bg-gray-200 cursor-pointer" on:click={(e) => select(e,elm.value)}>
			{#if selected == elm.value}
				<CheckIcon />
			{/if}
			<span class="{selected == elm.value ? 'ml-1':'ml-5'} pr-2">
				{elm.label}
			</span>
		</div>
	{/each}
</div>