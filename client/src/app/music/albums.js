angular.module('app')
    .config(['$stateProvider',
        function($stateProvider) {
            $stateProvider.state('filteredAlbums', {
                url: '/music/albums/:filter/:filterId',
                views: {
                    header: {
                        templateUrl: 'layout/headers/backable.tpl.html'
                    },
                    body: {
                        templateUrl: 'music/artist.albums.tpl.html',
                        controller: 'MusicAlbumsCtrl'
                    }
                }
            });
        }
    ])
    .controller('MusicAlbumsCtrl', ['$scope', '$stateParams', 'storage',
        function MusicAlbumsCtrl($scope, $stateParams, storage) {
            $scope.loading = true;
            $scope.updating = true;

            $scope.filter = $stateParams.filter;

            var filter = null;
            if ($scope.filter) {
                $scope.filterId = parseInt($stateParams.filterId);
                filter = {
                    key: $scope.filter,
                    value: $scope.filterId
                };
            }

            function onArtistFromSource (artist) {
                $scope.artist = artist;
                $scope.loading = false;
                $scope.updating = false;

            };

            function onAlbumsFromCache(albums) {
                if(albums) {
                    $scope.albums = albums;
                    $scope.loading = false;
                }
            };

            function onAlbumsFromSource(albums) {
                $scope.albums = albums;
                if ($scope.filter) {
                    storage.setItem('AudioLibrary.Albums', albums);
                }
                $scope.xbmc.getArtistDetails(albums[0].artistid[0], onArtistFromSource);
            };

            var onLoad = function() {
                storage.getItem('AudioLibrary.Albums', onAlbumsFromCache);
                $scope.xbmc.getAlbums(filter, onAlbumsFromSource);
            };
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', {
                    fn: onLoad,
                    scope: this
                });
            }

            $scope.hasCover = function(album) {
                return album.thumbnail !== '';
            }
        }
    ]);