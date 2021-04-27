<script>

	import DropDown from './DropDown.svelte'
	import DownIcon from '../Icons/DownIcon.svelte'
	
	export let setClass
	export let klass  = ''

	let code_class  = 'code text-sm font-mono px-8 py-6 bg-gray-200'
	let quote_class  = 'quote text-xl border-l-4 border-gray-800 px-4 font-serif'

	$: text_class = (klass.includes('code')&&code_class) || (klass.includes('quote')&&quote_class) ||  klass.split(' ').find(c => c.startsWith('text')) || ''
	$: selected_val = text_class

	
	$: selected = list.find(e => e.value==selected_val)
	$: selected_label = (selected&&selected.label)||'Text'

	let list = [
		{
			label:'Text Small',
			value:'text-sm'
		},
		{
			label:'Text',
			value:'text-base'
		},
		{
			label:'Code',
			value: code_class
		},
		{
			label:'Quote',
			value: quote_class
		},
		{
			label:'Heading 1',
			value:'text-6xl'
		},
		{
			label:'Heading 2',
			value:'text-5xl'
		},
		{
			label:'Heading 3',
			value:'text-4xl'
		},
		{
			label:'Heading 4',
			value:'text-3xl'
		},
		{
			label:'Heading 5',
			value:'text-2xl'
		},
		{
			label:'Heading 6',
			value:'text-xl'
		}
	]

	let open = false
	function selectClass(evt){
		selected_val = evt.detail
		open = false
		setClass(evt.detail)
	}
</script>

<div class="flex h-full">
	<DropDown {list} bind:open={open} selected={selected_val} on:select={selectClass} class="w-32">
		<div class="pl-2 pr-3 py-1 h-full flex items-center whitespace-nowrap flex-shrink-0">
			{selected_label} <DownIcon />
		</div>
	</DropDown>
</div>