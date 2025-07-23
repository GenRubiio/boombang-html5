<a href="javascript:void(0)" onclick="copyToClipboard(this)" data-id="copy-{{$entry->id}}" class="btn btn-sm btn-link" style="text-decoration:none"><i class="las la-copy"></i> {{trans('admin.copy_link')}}</a>
<span class="d-none" id="copy-{{$entry->id}}">{{$entry->url_file}}</span>

<script>
	function copyToClipboard(button) {
		let buttonSelector = $(button);
		let id = buttonSelector.data('id');
		let r = document.createRange();
		let selectorId = $('#'+id);
		selectorId.removeClass('d-none');
		r.selectNode(document.getElementById(id));
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);
		document.execCommand('copy');
		selectorId.addClass('d-none');
		window.getSelection().removeAllRanges();
	}
</script>
