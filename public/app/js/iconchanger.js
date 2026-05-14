var matcher = window.matchMedia('(prefers-color-scheme: dark)');
matcher.addListener(onUpdate);
onUpdate();

function onUpdate() {
    var lightSchemeIconApple = document.querySelector('link#light-scheme-icon-apple');
    var lightSchemeIcon = document.getElementById('light-scheme-icon');
    var darkSchemeIconApple = document.querySelector('link#dark-scheme-icon-apple');
    var darkSchemeIcon = document.querySelector('link#dark-scheme-icon');
    if (matcher.matches) {
        lightSchemeIcon.remove();
        lightSchemeIconApple.remove();
        document.head.append(darkSchemeIcon);
        document.head.append(darkSchemeIconApple);
    } else {
        document.head.append(lightSchemeIcon);
        document.head.append(lightSchemeIconApple);
        darkSchemeIcon.remove();
        darkSchemeIconApple.remove();
    }
}