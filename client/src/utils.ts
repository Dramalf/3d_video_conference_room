export function BrowserType() {
    const ua = navigator.userAgent.toLowerCase();
    const testUa = (regexp: RegExp) => regexp.test(ua);
    const testVs = (regexp: { [Symbol.match](string: string): RegExpMatchArray | null; }) => (ua.match(regexp) + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".");
    // 接上以上if...else条件判断
    let system = "unknown";
    if (testUa(/oculus|quest/ig)) {
        system = "oculus";
    } else if (testUa(/windows|win32|win64|wow32|wow64/ig)) {
        system = "windows"; // window系统
    } else if (testUa(/macintosh|macintel/ig)) {
        system = "osx"; // osx系统
    } else if (testUa(/x11/ig)) {
        system = "linux"; // linux系统
    } else if (testUa(/android|adr/ig)) {
        system = "android"; // android系统
    } else if (testUa(/ios|iphone|ipad|ipod|iwatch/ig)) {
        system = "ios"; // ios系统
    }

    // ......
    // 获取到system、systemVs、platform、engine、engineVs、supporter、supporterVs、shell、shellVs
    return system
}