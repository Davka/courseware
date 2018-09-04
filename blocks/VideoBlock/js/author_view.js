import $ from 'jquery'
import Backbone from 'backbone'
import AuthorView from 'js/author_view'
import helper from 'js/url'

export default AuthorView.extend({
    events: {
        'click button[name=save]': 'saveVideo',
        'click button[name=cancel]': 'switchBack',
        'change select.videotype': 'selection',
        'click button[name=preview]': 'showPreview',
        'click button[name=addmediatype]': 'addmediatype',
        'change select.cw-webvideo-source': 'toggleSourceEvent'
    },

    initialize() {
        Backbone.on('beforemodeswitch', this.onModeSwitch, this);
        Backbone.on('beforenavigate', this.onNavigate, this);
    },

    onNavigate(event) {
        if (!$('section .block-content button[name=save]').length) {
          return;
        }
        if (event.isUserInputHandled) {
          return;
        }
        event.isUserInputHandled = true;
        Backbone.trigger('preventnavigateto', !confirm('Es gibt nicht gespeicherte Änderungen. Möchten Sie die Seite trotzdem verlassen?'));
    },

    onModeSwitch(toView, event) {
        if (toView != 'student') {
          return;
        }
        // the user already switched back (i.e. the is not visible)
        if (!this.$el.is(':visible')) {
          return;
        }
        // another listener already handled the user's feedback
        if (event.isUserInputHandled) {
          return;
        }
        event.isUserInputHandled = true;
        Backbone.trigger('preventviewswitch', !confirm('Es gibt nicht gespeicherte Änderungen. Möchten Sie trotzdem fortfahren?'));
    },

    render() {
        return this;
    },

    postRender() {
        var view = this;
        var url = view.$('.cw-videoblock-stored-url').val();
        var aspect = view.$('.cw-videoblock-stored-aspect').val();
        var webvideosrc = view.$('.webvideodata').val();
        var videotype = '';
        if (url != '') {
            videotype = 'url';
        } else {
            videotype = 'webvideo';
        }
        view.$('.videotype option[value=' + videotype + ']').attr('selected', true);
        view.$('.cw-videoblock-aspect option[value=' + aspect + ']').attr('selected', true);
        view.selection();
        view.showPreview();
    },

    saveVideo() {
        var view = this;
        var videotype = this.$('.videotype').val();
        var status = this.$('.status');
        var aspect = this.$('select.cw-videoblock-aspect').val();
        var videoTitle = this.$el.find('.videotitle').val();
        var url, webvideo, webvideosettings;

        if (videotype == 'webvideo') {
            url = '';
            webvideosettings = 'controls ';
            webvideo = new Array();
                this.$('.videosource-webvideo > .webvideo').each(function () {
                let source = $(this).find('.cw-webvideo-source').val();
                let src = '';
                if (source == 'url') {
                    src = $(this).find('.cw-webvideo-source-url').val();
                } else {
                    src =  $(this).find('.cw-webvideo-source-file option:selected').attr('file_url');
                }
                let type = $(this).find('.webvideosrc-mediatype').val();
                let query = $(this).find('.webvideosrc-mediaquery').val();
                let media = '', attr = '';
                switch (query) {
                    case 'normal':
                        media = '';
                        break;
                    case 'large':
                        media = 'screen and (min-device-width:801px)';
                        break;
                    case 'small':
                        media = 'screen and (max-device-width:800px)';
                        break;
                }
                if (src != '') {
                    webvideo.push({ src, source, type, query, media, attr });
                }
            });
            if (view.$el.find('.videoautostart').is(':checked')) {
                webvideosettings += 'autoplay ';
            }
            webvideo = JSON.stringify(webvideo);
        } else {
          url = this.$el.find('.videosrc').val()
          webvideo = '';
          webvideosettings = '';
        }
        status.text('Speichere Änderungen...');

        helper.callHandler(this.model.id, 'save', {
          url, webvideo, webvideosettings, videoTitle, aspect
        }).then(function () {
          status.text('Änderungen wurden gespeichert.');
          view.switchBack();
        }).catch(function (error) {
          status.text('Fehler beim Speichern: ' + $.parseJSON(error.responseText).reason);
        });
    },

    selection() {
        var videotype = this.$('.videotype').val();
        var videourl = this.$('.videourl').val();
        this.$el.find('.videosource').hide();
        switch (videotype) {
            case 'webvideo':
                var webvideodata = this.$('.webvideodata').val();
                this.$el.find('.videosource-webvideo').show();
                this.$el.find('video').show();
                this.$el.find('iframe').hide();
                if (webvideodata == '') {
                    break;
                }
                this.setVideoData();
                break;
            case 'url':
                this.$el.find('.videosource-url').show();
                this.$el.find('iframe').show();
                this.$el.find('video').hide();
                break;
        }
    },

    addmediatype(event, src, type, query, source) {
        var $addmediatype = this.$('.addmediatype');
        var $webvideo = this.$('.videosource-webvideo > .webvideo').first().clone();
        if (source == 'url') {
            $webvideo.find('.cw-webvideo-source option[value="url"]').prop('selected', true);
            $webvideo.find('.cw-webvideo-source-url').val(src);
        } else {
            $webvideo.find('.cw-webvideo-source option[value="file"]').prop('selected', true);
            $webvideo.find('.cw-webvideo-source-file option[file_url="'+src+'"]').prop('selected', true);
        }
        $webvideo.find('.webvideosrc-mediatype option[value="' + type + '"]').prop('selected', true);
        $webvideo.find('.webvideosrc-mediaquery option[value="' + query + '"]').prop('selected', true);
        $webvideo.insertBefore($addmediatype);
        if (source == 'url') {
            $webvideo.find('.cw-webvideo-source-url').show();
            $webvideo.find('.cw-webvideo-source-file').hide();
        } else {
            $webvideo.find('.cw-webvideo-source-file').show();
            $webvideo.find('.cw-webvideo-source-url').hide();
        }
    },

    setVideoData() {
        var view = this;
            var webvideodata = view.$el.find('.webvideodata').val();
            var webvideosettingsdata = view.$el.find('.webvideosettingsdata').val();
            if (webvideodata != '[]') {
                webvideodata = $.parseJSON(webvideodata);
                view.$el.find('video').attr('src', webvideodata[0].src);
                $.each(webvideodata, function (key, value) {
                    view.addmediatype(null, value.src, value.type, value.query, value.source);
                });
                view.$('.videosource-webvideo > .webvideo').first().remove();
            }
            if (webvideosettingsdata.indexOf('autoplay') > -1) {
                view.$el.find('.videoautostart').prop('checked', true);
            }
    },

    showPreview() {
        this.$('iframe').attr('src', this.$('.cw-videoblock-stored-url').val());
        this.$('video').attr('src', this.$('.webvideosrc').val());
        this.$('.video-wrapper').removeClass('aspect-43').removeClass('aspect-169').addClass(this.$('.cw-videoblock-aspect').val());
    },

    toggleSourceEvent(event) {
        var source = $(event.currentTarget);
        this.toggleSource(source);
    },

    toggleSource(source) {
        var webvideo = source.parents('.webvideo');
        var file = webvideo.find('.cw-webvideo-source-file'),
            url = webvideo.find('.cw-webvideo-source-url');
        if (source.val() == 'url') {
            file.hide();
            url.show();

        } else {
            file.show();
            url.hide();
        }
    }
});
