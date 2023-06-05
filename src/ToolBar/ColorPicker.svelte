<script>
	import DownIcon from '../Icons/DownIcon.svelte'
	
	export let setColorFn
	export let setBgColorFn
	export let hex

	let sending = false
	let node

	function displayColors(){
		node.click()
	}

	function setColor() {
		if(hex.startsWith("#")){
			!setColorFn&&!setBgColorFn&&setClass(txt+"-["+hex+"]")
			txt==="text" ? setColorFn?.(hex) : setBgColorFn?.(hex)
		}
	}

	export let txt = 'text'
	export let setClass
	// get color from klass
	export let klass

	$: if(klass) {
		let h = ""
		if(txt === "text") {
			h = klass.replace(/.*text-\[([^\]]*)\].*/i,"$1")
		}else {
			h = klass.replace(/.*bg-\[([^\]]*)\].*/i,"$1")
		}
		if(h.startsWith("#")){
			hex = h
		}
	}

	function updateColor() {
		if(sending) return
		sending = true
		setTimeout(() => {
			setColor(hex)
			sending = false
		},400)
	}

	$: if (hex) {
		updateColor()
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
