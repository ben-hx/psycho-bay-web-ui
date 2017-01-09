var app = angular.module('myApp.footer', ['myApp.model', 'xeditable']);

app.controller('FooterCtrl', ['$scope', '$state', 'ViewModel', 'ModalModelService', function ($scope, $state, ViewModel, ModalModelService) {

    $scope.ViewModel = ViewModel;

    $scope.$on('dirtyChanged', function (event, isDirty) {
        if (!isDirty) {
            $scope.form.$setPristine();
        }
    });

    $scope.$watch('form.$dirty', function (newValue, oldValue) {
        ViewModel.setDirty($scope.form.$dirty);
    }, true);

    $scope.addItem = function (model) {
        if (model.items.length < 3) {
            model.items.push({caption: "Item", detail: "Hier kommt ein neuer Text!"});
        }
    };

    $scope.removeItem = function (model, itemIndex) {
        $scope.form.$setDirty();
        model.splice(itemIndex, 1);
    };

    $scope.openModal = function (textModel) {
        ModalModelService.open(textModel.detail).then(function (data) {
            if (textModel.detail != data) {
                textModel.detail = data;
                $scope.form.$setDirty();
            }
        });
    };

}]);