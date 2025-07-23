const NavbarController = {
    navbarHeaderEl: {
        navSelector: 'nav',
        headerSelector: '.header',
        scrolledClass: 'scrolled',
        openClass: 'open',
        hamburgerIconClass: '.hamburger',
        hamburgerIconIsActiveClass: 'is-active',
        navbarCurtainClass: '.navbar-curtain',
    },

    init() {
        this.setListeners();
        this.initNavbarScrolled();
    },

    setListeners() {
        document
            .querySelector(this.navbarHeaderEl.hamburgerIconClass)
            .addEventListener("click", ev => this.initHamburguerMenu(ev));
        document
            .querySelector(this.navbarHeaderEl.navbarCurtainClass)
            .addEventListener("click", ev => this.handleClickOutsideNavbar(ev));
    },

    initHamburguerMenu(ev) {
        const icon = document.querySelector(this.navbarHeaderEl.hamburgerIconClass);
        icon.classList.toggle(this.navbarHeaderEl.hamburgerIconIsActiveClass);
        const nav = document.querySelector(this.navbarHeaderEl.navSelector);
        nav.classList.toggle(this.navbarHeaderEl.openClass);
        const header = document.querySelector(this.navbarHeaderEl.headerSelector);
        header.classList.toggle(this.navbarHeaderEl.openClass);
    },

    initNavbarScrolled() {
        window.addEventListener('scroll', () => this.handleNavbarScrolled());
        this.handleNavbarScrolled();

        window.addEventListener('resize', () => this.handleResize());
    },

    handleClickOutsideNavbar() {
        this.handleResize();
    },

    handleResize() {
        const hamburgerIcon = document.querySelector(this.navbarHeaderEl.hamburgerIconClass);
        if (hamburgerIcon.classList.contains(this.navbarHeaderEl.hamburgerIconIsActiveClass)) {
            const clicEvent = new MouseEvent('click', {
                bubbles: true, // Permitir que el evento se propague
                view: window // Especificar la ventana asociada al evento
            });
            // Despacha el evento de clic en el elemento hamburgerIcon
            hamburgerIcon.dispatchEvent(clicEvent);
        }
    },

    handleNavbarScrolled() {
        const scroll = window.scrollY;
        const header = document.querySelector(this.navbarHeaderEl.headerSelector);
        const nav = document.querySelector(this.navbarHeaderEl.navSelector);
        let distanceScrolled = 50;

        if (scroll > distanceScrolled) {
            header.classList.add(this.navbarHeaderEl.scrolledClass);
            nav.classList.add(this.navbarHeaderEl.scrolledClass);
        } else {
            header.classList.remove(this.navbarHeaderEl.scrolledClass);
            nav.classList.remove(this.navbarHeaderEl.scrolledClass);
        }
    },
};

export default NavbarController;
