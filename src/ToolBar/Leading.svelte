<script>
	import DropDown from './DropDown.svelte'
	import LineHeightIcon from '../Icons/LineHeightIcon.svelte'
	export let klass = ''
	export let setClass = ''
	$: leading_class = klass.split(' ').find(c => c.startsWith('leading')) || ''
	$: selected = leading_class.replace('leading-','')
	let open = false 
	function selectClass(evt){
		open = false
		selected = evt.detail
		setClass('leading-'+evt.detail)
	}

	let list = [
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
</script>

<div class="flex h-full">
	<DropDown {list} bind:open={open} on:select={selectClass} {selected} class="text-sm">
		<div class="pl-2 pr-3 py-1 h-full flex items-center">
			<LineHeightIcon />
		</div>
	</DropDown>
</div>