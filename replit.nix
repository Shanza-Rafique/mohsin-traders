{ pkgs }: {
    deps = [
        pkgs.nodejs_18
        pkgs.nodePackages.npm
        pkgs.nodePackages.pm2
    ];
}