export default {
  methods: {
    mixin_getToken: function () {
      const access_token = `${
        gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
          ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
              .id_token
          : window.$cookies.get("access_token")
      }`;
      return access_token;
    },
    signedInWithGoogle: function () {
      return (
        gapi.auth2.getAuthInstance() &&
        gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
      );
    },
    mixin_signedInLocally: function () {
      return !!window.$cookies.get("access_token");
    },
    mixin_signOut: async function () {
      if (this.signedInWithGoogle()) {
        gapi.auth2.getAuthInstance().signOut();
      } else {
        window.$cookies.remove("access_token");
      }
    },
    mixin_getGoogleUser: async function () {
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
      return googleUser;
    },
  },
};
