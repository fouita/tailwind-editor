<script>
    export let alt 
    export let src 
    export let klass = ''
	let show_link = false
	export let setMedia
    export let cancel

	function addMedia(){
		setMedia({
            src,
            klass,
            alt
        })
	}

	function cancelMedia(){
		cancel()
    }
    
    export let base_node
    function setPosition(node){
		let e = window.event;
		if(!base_node) return
		
		let elm = base_node.parentNode.tagName == 'DIV' ? base_node : base_node.parentNode
		let rect = elm.parentNode.getBoundingClientRect()
		let posY = rect.top; 
		if(elm.previousElementSibling){
			let ch_nodes = [...elm.parentNode.childNodes]
			let siblings = ch_nodes.slice(0,ch_nodes.indexOf(elm)+1)
			let br = siblings.reverse().find(elm => elm.tagName == 'BR')
			if(br){
				rect = br.getBoundingClientRect()
				posY = rect.top ? rect.top : posY
			}
		}
		node.style.top = `${posY+window.scrollY}px`
	}
</script>



<div use:setPosition class="absolute -mt-6 p-3 shadow-xl flex flex-col rounded bg-white z-20">
    {#if src}
        <input type="text" bind:value={src} placeholder="Image src" class="bg-gray-100 text-sm font-mono mb-2 border p-1 w-64 rounded focus:outline-none shadow-inner" >
    {/if}
    <input type="text" bind:value={alt} placeholder="Image alt" class="bg-gray-100 text-sm font-mono mb-2 border p-1 w-64 rounded focus:outline-none shadow-inner" >
    <input type="text" bind:value={klass} placeholder="Class" class="bg-gray-100 text-sm font-mono border p-1 w-64 rounded focus:outline-none shadow-inner" >
    <div class="flex items-center flex-row-reverse mt-2">
        <button class="hover:bg-gray-300 px-3 rounded focus:outline-none" on:click={cancelMedia}>
            Cancel
        </button>
        <button class="ml-2 hover:bg-gray-300 px-3 rounded focus:outline-none" on:click={addMedia}>
            Set image
        </button>
    </div>
</div>

