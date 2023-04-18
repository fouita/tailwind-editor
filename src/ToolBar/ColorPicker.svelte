<script>
	import DownIcon from '../Icons/DownIcon.svelte'
	
	let hex
	let node


	function displayColors(){
		node.click()
	}

	function setColor() {
		setClass(txt+"-["+hex+"]")
	}

	$:if(hex) {
		setColor(hex)
	}

	export let txt = 'text'
	export let setClass
	// get color from klass
	export let klass

	$: if(klass) {
		if(txt === "text") {
			hex = klass.replace(/.*text-\[([^\]]*)\].*/i,"$1")
		}else {
			hex = klass.replace(/.*bg-\[([^\]]*)\].*/i,"$1")
		}
	}

</script>

<div class="flex">
	<input bind:this={node} 
		class="cursor-pointer opacity-0 w-0" type="color" bind:value={hex} />
	<div
		style="{txt==='text' ? 'color':'background'}:{hex}"
		class="font-medium flex items-center cursor-pointer px-1" on:click={displayColors} on:keydown on:keyup>
		<span class="">A</span> <DownIcon />
	</div>
</div>
