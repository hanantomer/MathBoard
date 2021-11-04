export default {
  methods: {
    authMixin_getToken: function () {
      const token = `${
        gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
          ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
              .id_token
          : this.$cookies.get("token")
      }`;
      return token;
    },
    authMixin_signedInWithGoogle: function () {
      return gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
    },
    authMixin_signedInLocally: function () {
      return !!this.$cookies.get("token");
    },
    authMixin_signOut: async function () {
      if (this.authMixin_signedInWithGoogle()) {
        gapi.auth2.getAuthInstance().signOut();
      } else {
        this.$cookies.remove("token");
      }
    },
    authMixin_getGoogleUser: async function () {
      let auth2 = await gapi.auth2.init();
      if (!auth2.currentUser.get().isSignedIn()) {
        return;
      }
      let googleUser = {};
      let userProfile = auth2.currentUser.get().getBasicProfile();
      googleUser.name = userProfile.getName();
      googleUser.email = userProfile.getEmail();
      googleUser.imageUrl = userProfile.getImageUrl();
      googleUser.id_token = auth2.currentUser.get().getAuthResponse().id_token;
      //this.googleUser = googleUser;
      return googleUser;
    },
  },
};
