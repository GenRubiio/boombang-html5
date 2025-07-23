<div id="previewEmail">
    <iframe id="previewEmail" style="width:100%; height:700px;"></iframe>
</div>

<script>
    var emailIframe = document.getElementById('previewEmail');
    var doc = emailIframe.contentWindow.document;
    doc.open();
    doc.write(`{!!$field['view'] !!}`);
    doc.close();
</script>
