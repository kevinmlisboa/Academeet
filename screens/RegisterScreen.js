import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { loadFont } from "../misc/loadFont";
import { SvgXml } from "react-native-svg";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SVGLogo } from "../misc/loadSVG";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  isValidEmail,
  isValidObjField,
  validationSchema,
} from "../methods/validator";
import { Formik } from "formik";
import { auth, db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [fontLoaded, setFontLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userRegisterCredential = {
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  };

  useEffect(() => {
    loadFont().then(() => setFontLoaded(true));
  }, []);

  if (!fontLoaded) {
    return null;
  }

  const distinctUserName = async (userName) => {
    const userNameSnapshot = await db
      .collection("User")
      .where("userName", "==", userName)
      .get();
    return userNameSnapshot.empty;
  };

  const registerAccount = async (values, formikActions) => {
    try {
      console.log(values.email);
      const isUserNameUnique = await distinctUserName(values.userName);
      if (!isUserNameUnique) {
        console.log(`${values.userName} is already taken`);
        return;
      }
      const userCredential = await auth.createUserWithEmailAndPassword(
        values.email,
        values.confirmPassword
      );
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({ displayName: values.userName });
        await db.collection("User").doc(user.displayName.toString()).set({
          email: values.email,
          userName: values.userName,
        });

        await AsyncStorage.setItem("email", values.email);
        await AsyncStorage.setItem("password", values.confirmPassword);
        navigation.replace("NameScreen");
        formikActions.resetForm();
        formikActions.setSubmitting(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={userRegisterCredential}
        onSubmit={registerAccount}
        validationSchema={validationSchema}
      >
        {({
          values,
          handleChange,
          errors,
          touched,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => {
          const { userName, email, password, confirmPassword } = values;
          return (
            <>
              <View style={styles.centerView}>
                <SvgXml xml={SVGLogo} />
                <Text style={styles.logoText}>academeet</Text>
              </View>

              <View style={styles.textInputContainer}>
                {touched.userName && errors.userName && (
                  <Text style={styles.errorMessage}>{errors.userName}</Text>
                )}
                <TextInput
                  style={styles.inputField}
                  onChangeText={handleChange("userName")}
                  value={userName}
                  placeholder="Username"
                  placeholderTextColor="#6D6D6D"
                  onBlur={handleBlur("userName")}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorMessage}>{errors.email}</Text>
                )}
                <TextInput
                  style={styles.inputField}
                  onChangeText={handleChange("email")}
                  value={email}
                  placeholder="Email"
                  placeholderTextColor="#6D6D6D"
                  onBlur={handleBlur("email")}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorMessage}>{errors.password}</Text>
                )}
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInputField}
                    onChangeText={handleChange("password")}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#6D6D6D"
                    secureTextEntry={!showPassword}
                    onBlur={handleBlur("password")}
                    error={touched.password && errors.password}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIconContainer}
                  >
                    <Entypo
                      name={showPassword ? "eye" : "eye-with-line"}
                      size={24}
                      color="#6D6D6D"
                    />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorMessage}>
                    {errors.confirmPassword}
                  </Text>
                )}
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInputField}
                    onChangeText={handleChange("confirmPassword")}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#6D6D6D"
                    secureTextEntry={!showConfirmPassword}
                    onBlur={handleBlur("confirmPassword")}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIconContainer}
                  >
                    <Entypo
                      name={showConfirmPassword ? "eye" : "eye-with-line"}
                      size={24}
                      color="#6D6D6D"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ alignItems: "center" }}>
                <View style={styles.registerButtonContainer}>
                  <TouchableOpacity
                    style={
                      !isSubmitting
                        ? [styles.button, styles.registerButton]
                        : [
                            styles.button,
                            styles.registerButton,
                            { opacity: 0.5 },
                          ]
                    }
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.registerText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("LogInScreen")}
                  >
                    <Text style={styles.registerLink}>Login here.</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          );
        }}
      </Formik>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  centerView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(15),
  },
  inputField: {
    fontFamily: "lato-light",
    width: wp(65),
    height: hp(6),
    borderWidth: wp(0.3),
    borderColor: "#414042",
    borderRadius: wp(5),
    marginTop: hp(1),
    marginHorizontal: wp(4),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: "#FFFFFF",
    fontSize: hp(2.5), // Changed font size
  },
  passwordInputField: {
    flex: 1,
    fontSize: hp(2.5), // Changed font size
    fontFamily: "lato-light",
  },
  textInputContainer: {
    fontFamily: "lato-light",
    fontSize: wp(4),
    color: "#414042",
    alignSelf: "center",
    padding: hp(2),
  },
  passwordInputContainer: {
    width: wp(65),
    height: hp(6),
    borderWidth: wp(0.3),
    borderColor: "#414042",
    borderRadius: wp(5),
    marginTop: hp(1),
    marginHorizontal: wp(4),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: "#FFFFFF",
    fontSize: wp(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  eyeIconContainer: {
    marginRight: wp(2),
  },

  logoText: {
    fontFamily: "lato-bold",
    fontSize: wp(8),
    color: "#FF9E00",
  },
  container: {
    backgroundColor: "#023E8A",
    flex: 1,
  },
  registerButtonContainer: {
    marginTop: hp(4),
  },
  button: {
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(6),
    borderRadius: wp(4),
    marginRight: wp(3),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: "#0077B6",
    bottom: hp(3),
  },
  buttonText: {
    fontFamily: "lato-light",
    fontSize: wp(4),
    color: "#FFFFFF",
  },
  registerText: {
    fontFamily: "lato-light",
    fontSize: wp(3.5),
    color: "#FFFFFF",
  },
  registerLink: {
    fontFamily: "lato-regular",
    fontSize: wp(3.5),
    color: "#FFFFFF",
  },
  errorMessage: {
    color: "#FF9E00",
    fontFamily: "lato-regular",
    fontSize: wp(3),
    textAlign: "right",
    marginHorizontal: wp(8),
    marginVertical: hp(0.2),
  },
});
