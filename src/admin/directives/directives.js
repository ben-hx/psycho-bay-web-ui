'use strict';

var app = angular.module('myApp.directives', ['ngFileUpload', 'xeditable', 'myApp.config', 'myApp.image-upload']);

app.directive("imageUpload", ['$compile', '$parse', function ($compile, $parse) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        require: 'ngModel',
        scope: {
            options: '=',
            onSuccess: '&',
            onProgress: '&',
            onError: '&'
        },
        templateUrl: '/src/admin/directives/image-upload.html',
        link: function ($scope, $element, $attrs, ngModel) {
            var image = $element.find('#image');
            image.addClass($element.attr('class'));
            $scope.$watch(function () {
                return ngModel.$modelValue;
            }, function (newValue) {
                image.attr('src', newValue);
                image.hide();
                image.fadeIn("slow", function () {
                });
            });
        },
        controller: ['$scope', '$timeout', 'config', 'Upload', function ($scope, $timeout, config, Upload) {

            $scope.$watch('file', function () {
                $scope.upload($scope.file);
            });

            $scope.dismissProgressBar = function () {
                $timeout(function () {
                    $scope.fileUploadValue = undefined;
                }, $scope.options.progressBarTimeToDismiss);
            };

            $scope.upload = function (file) {
                if (file && !file.$error) {
                    Upload.upload({
                        url: $scope.options.uploadUrl,
                        data: {
                            file: file
                        }
                    }).then(function (response) {
                        if ($scope.onSuccess) {
                            $scope.onSuccess({response: response.data});
                        }
                        $scope.ngModel = response.data.files[0];
                        $scope.dismissProgressBar();
                    }, function (error) {
                        if ($scope.onError) {
                            $scope.onError({error: error});
                        }
                        $scope.dismissProgressBar();
                    }, function (event) {
                        $scope.fileUploadValue = parseInt(100.0 * event.loaded / event.total);
                        if ($scope.onProgress) {
                            $scope.onProgress({event: event});
                        }
                    });
                }
            };
        }]
    };
}]);

app.directive("editableCarousel", ['$compile', '$parse', 'ImageUploadService', function ($compile, $parse, ImageUploadService) {
    return {
        restrict: 'E',
        replace: true,
        require: 'ngModel',
        scope: {
            ngModel: '=',
            imgClass: '@',
            options: '=',
            onChange: '&',
            onProgress: '&',
            onError: '&'
        },
        templateUrl: '/src/admin/directives/editable-carousel.html',
        link: function ($scope, $element, attrs, ngModel) {
        },
        controller: ['$scope', '$timeout', 'config', 'Upload', function ($scope, $timeout, config, Upload) {
            $scope.editImages = function () {
                ImageUploadService.open({
                    uploadUrl: $scope.options.uploadUrl,
                    onChange: $scope.onChange,
                    onProgress: $scope.onProgress,
                    onError: $scope.onError,
                    images: $scope.ngModel
                }, $scope).then(function (result) {
                    $scope.ngModel = result.images;
                });
            };
        }]
    };
}]);


app.directive("fileUpload", ['$compile', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onSuccess: '&',
            onProgress: '&',
            onError: '&'
        },
        link: function (scope, elem, attr) {
            var text = elem.html();
            var component = "";
            component += "<div ngf-drop ngf-select ";
            component += "ngf-drag-over-class=\"'dragover'\" ngf-multiple=\"true\" ngf-allow-dir=\"true\" ";
            component += "accept=\"image\/*,application\/pdf\" ";
            component += "ngf-pattern=\"'image\/*,application\/pdf'\">" + text + "<\/div> ";
            component += "<div ngf-no-file-drop>File Upload is not supported for this browser<\/div> ";
            var wrapper = angular.element(component);
            wrapper.addClass(elem.attr('class'));
            wrapper.attr('ng-model', elem.attr('ng-model'));
            elem.html('');
            elem.before(wrapper);
            $compile(wrapper)(scope);
            wrapper.append(elem);
        },
        controller: ['$scope', '$timeout', 'config', 'Upload', function ($scope, $timeout, config, Upload) {

            $scope.$watch('files', function () {
                $scope.upload($scope.files);
            });

            $scope.upload = function (files) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            Upload.upload({
                                url: config.apiUrl + '/upload',
                                data: {
                                    file: file
                                }
                            }).then(function (response) {
                                if ($scope.onSuccess) {
                                    $scope.onSuccess({response: response.data});
                                }
                            }, function (error) {
                                if ($scope.onError) {
                                    $scope.onError({error: error});
                                }
                            }, function (event) {
                                if ($scope.onProgress) {
                                    $scope.onProgress({event: event});
                                }
                            });
                        }
                    }
                }
            };
        }]
    };
}]);

app.directive("sectionButton", function () {

    var defaultConfig = {
        icon: 'fa-file-image-o',
        iconSize: 1
    };

    return {
        restrict: 'E',
        replace: true,
        require: 'ngModel',
        templateUrl: '/src/admin/directives/section-icon-selection.html',
        link: function ($scope, $element, $attrs, ngModel) {
            var button = $element.find('#button');
            button.addClass($element.attr('class'));
            $element.removeAttr('class');
        },
        controller: ['$scope', '$element', '$attrs', 'config', function ($scope, $element, $attrs, config) {
            var ngModel = $element.controller('ngModel');
            $scope.iconSize = $element.attr('icon-size') || defaultConfig.iconSize;

            ngModel.$render = function () {
                $scope.currentIcon = ngModel.$viewValue || defaultConfig.icon;
            };

            $scope.icons = config.sectionItems;
            $scope.changeCurrentIcon = function (icon) {
                $scope.currentIcon = icon;
                ngModel.$setViewValue(icon);
                $scope.popoverIsOpen = false;
            };
        }]
    };
});

app.component('openMore', {
    transclude: true,
    bindings: {
        'ngModel': '<',
        'show': '='
    },
    require: {
        richTextEditor: '^richTextEditor',
        ngModelCtrl: 'ngModel'
    },
    template: '<a id="open-more" class="open-more" ng-click="openMore()" href=""><ng-transclude></ng-transclude></a>',
    controller: ['$scope', '$element', 'ModalModelService', function ($scope, $element, ModalModelService) {
        var self = this;
        var openMoreElement;
        var openMoreElementToolbar;

        this.$onInit = function () {
            self.richTextEditor.quillConfig = {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            [{'size': ['small', 'normal', 'large', 'huge']}],
                            [{'align': []}],
                            ['clean'],
                            ['open-more']
                        ],
                        handlers: {
                            'open-more': function (value) {
                                self.show = !self.show;
                                self.doShowOpenMore(self.show);
                                self.ngModelCtrl.$setDirty();
                            }
                        }
                    }
                },
                placeholder: self.placeholder || ''
            };
        };

        this.$postLink = function () {
            openMoreElement = $element.find('#open-more');
            self.doShowOpenMore(self.show);
        };

        this.doShowOpenMore = function (value) {
            if (value) {
                openMoreElement.removeClass('ng-hide');
            } else {
                if (!openMoreElement.hasClass('ng-hide')) {
                    openMoreElement.addClass('ng-hide');
                }
            }
        };

        $scope.openMore = function () {
            ModalModelService.open(self.ngModel).then(function (data) {
                self.ngModelCtrl.$setViewValue(data);
            });
        };
    }]
});

app.component('richTextEditor', {
    transclude: true,
    bindings: {
        'placeholder': '@?',
        'showToolBar': '<',
        'ngModel': '<'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    template: '<div><div id="editor"></div><ng-transclude></ng-transclude></div>',
    controller: ['$scope', '$element', function ($scope, $element) {
        var self = this;
        var content = '';
        var modelChanged = false;
        var editorChanged = false;
        var editor;
        var editorElement;
        var toolbarElement;
        this.quillConfig = {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: [
                        ['bold', 'italic', 'underline'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        [{'size': ['small', 'normal', 'large', 'huge']}],
                        [{'align': []}],
                        ['clean']
                    ]
                }
            },
            placeholder: self.placeholder || ''
        };

        this.$onChanges = function (changes) {
            if (changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) {
                content = changes.ngModel.currentValue;

                if (editor && !editorChanged) {
                    modelChanged = true;
                    if (content) {
                        editor.pasteHTML(content);
                        return;
                    }
                    editor.setText('');
                }
                editorChanged = false;
            }
            if (editor && changes.readOnly) {
                editor.enable(!changes.readOnly.currentValue);
            }

            if (editor && changes.showToolBar && changes.showToolBar.currentValue !== changes.showToolBar.previousValue) {
                self.doShowToolbar(changes.showToolBar.currentValue);
            }
        };

        this.doShowToolbar = function (value) {
            if (value) {
                editorElement.children[0].focus();
                toolbarElement.removeClass('ng-hide');
            } else {
                if (!toolbarElement.hasClass('ng-hide')) {
                    toolbarElement.addClass('ng-hide');
                }
            }
        };

        this.$postLink = function () {
            editorElement = $element.find('#editor')[0];
            editor = new Quill(editorElement, self.quillConfig);

            self.editor = editor;

            toolbarElement = $element.find('.ql-toolbar');
            self.doShowToolbar(self.showToolBar);

            if (content) {
                editor.pasteHTML(content);
            }

            editor.on('text-change', function () {
                var html = editorElement.children[0].innerHTML;
                if (html === '<p><br></p>') {
                    html = null;
                }
                if (!modelChanged) {
                    $scope.$apply(function () {
                        editorChanged = true;
                        self.ngModelCtrl.$setViewValue(html);
                    });
                }
                modelChanged = false;
            });

            editor.on('selection-change', function (range) {
                if (range) {
                    return;
                }
                $scope.$apply(function () {
                    self.ngModelCtrl.$setTouched();
                });
            });
        };
    }]
});

/**
 * directive to validate passwords in the html-view
 *
 * @directive passwordInput
 */
app.directive('passwordInput', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.passwordInput;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);

/**
 * directive to open the datepicker
 *
 * @directive dateclick
 */
app.directive("dateclick", function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.dateIsOpen = false;

            $scope.openCalendar = function (event) {
                event.preventDefault();
                event.stopPropagation();
                $scope.dateIsOpen = !$scope.dateIsOpen;
            };
        }
    }
});

/**
 * directive to open a dropdown-menu without
 * changing the route (href-directive)
 *
 * @directive dropdownclick
 */
app.directive("dropdownNoRouteChange", function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.dropDownIsOpen = false;

            $scope.openDropDown = function (event) {
                $scope.dropDownIsOpen = !$scope.dropDownIsOpen;
            };
        }
    }
});

app.directive('focus', ['$timeout', function ($timeout) {
    return {
        scope: {trigger: '@focus'},
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === "true") {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
        }
    };
}]);

app.directive('focusOnShow', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            if ($attr.ngShow) {
                $scope.$watch($attr.ngShow, function (newValue) {
                    if (newValue) {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }
            if ($attr.ngHide) {
                $scope.$watch($attr.ngHide, function (newValue) {
                    if (!newValue) {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }

        }
    };
}]);

app.directive('focusOnSetVisible', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            if ($attr.ngStyle) {
                $scope.$watch($attr.ngStyle, function (newValue) {
                    if (newValue.visibility && newValue.visibility == 'visible') {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }
        }
    };
}]);

app.directive('contenteditable', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            // don't do anything unless this is actually bound to a model
            if (!ngModel) {
                return
            }

            // options
            var opts = {}
            angular.forEach([
                'stripBr',
                'noLineBreaks',
                'selectNonEditable',
                'moveCaretToEndOnChange',
                'stripTags'
            ], function (opt) {
                var o = attrs[opt]
                opts[opt] = o && o !== 'false'
            })

            // view -> model
            element.bind('input', function (e) {
                scope.$apply(function () {
                    var html, html2, rerender
                    html = element.html()
                    rerender = false
                    if (opts.stripBr) {
                        html = html.replace(/<br>$/, '')
                    }
                    if (opts.noLineBreaks) {
                        html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '')
                        if (html2 !== html) {
                            rerender = true
                            html = html2
                        }
                    }
                    if (opts.stripTags) {
                        rerender = true
                        html = html.replace(/<\S[^><]*>/g, '')
                    }
                    ngModel.$setViewValue(html)
                    if (rerender) {
                        ngModel.$render()
                    }
                    if (html === '') {
                        // the cursor disappears if the contents is empty
                        // so we need to refocus
                        $timeout(function () {
                            element[0].blur()
                            element[0].focus()
                        })
                    }
                })
            })

            // model -> view
            var oldRender = ngModel.$render
            ngModel.$render = function () {
                var el, el2, range, sel
                if (!!oldRender) {
                    oldRender()
                }
                var html = ngModel.$viewValue || ''
                if (opts.stripTags) {
                    html = html.replace(/<\S[^><]*>/g, '')
                }

                element.html(html)
                if (opts.moveCaretToEndOnChange) {
                    el = element[0]
                    range = document.createRange()
                    sel = window.getSelection()
                    if (el.childNodes.length > 0) {
                        el2 = el.childNodes[el.childNodes.length - 1]
                        range.setStartAfter(el2)
                    } else {
                        range.setStartAfter(el)
                    }
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                }
            }
            if (opts.selectNonEditable) {
                element.bind('click', function (e) {
                    var range, sel, target
                    target = e.toElement
                    if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
                        range = document.createRange()
                        sel = window.getSelection()
                        range.setStartBefore(target)
                        range.setEndAfter(target)
                        sel.removeAllRanges()
                        sel.addRange(range)
                    }
                })
            }
        }
    }
}]);