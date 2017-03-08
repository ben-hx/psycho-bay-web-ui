$('#re-useable-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var content = button.data('content');
    var modal = $(this);
    modal.find('#content').html(content);
});