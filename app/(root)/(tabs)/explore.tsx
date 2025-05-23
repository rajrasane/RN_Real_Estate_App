import images from "@/constants/images";
import { useLocalSearchParams , router} from "expo-router";
import { Text, View  , Image, TouchableOpacity, FlatList, Button, ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card, FeaturedCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provider";
import seed from "@/lib/seed";
import { useAppwrite } from "@/lib/useAppWrite";
import { getLatestProperties, getProperties } from "@/lib/appwrite";
import { useEffect } from "react";
import NoResults from "@/components/NoResults";

export default function Explore() {

  const params = useLocalSearchParams<{query ?: string , filter?:string }>();

  const {data : properties , loading , refetch } = useAppwrite({
    fn : getProperties,
    params : {
      filter : params.filter!,
      query : params.query!,
      limit : 6,
    },
    skip : true,
  })

  const handleCardPress = (id : string) => {
    router.push(`/properties/${id}?source=explore`);
  }   

  useEffect(()=>{
    refetch({
      filter : params.filter!,
      query : params.query!,
      limit : 20,
    })
  },[params.filter,params.query])

  return (     
    <SafeAreaView className="bg-white h-full">
      <FlatList 
        ListEmptyComponent={loading?(
          <ActivityIndicator size='large' className="text-primary-300 mt-5"/>
        ) : <NoResults />
      }
        data={properties}
        renderItem={({item}) => <Card item={item} onPress={()=>handleCardPress(item.$id)}/>}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-[20px]">
              <TouchableOpacity onPress={()=>router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                <Image source={icons.backArrow} className="size-5"/>
              </TouchableOpacity>
              <Text 
                className="text-lg mr-2 text-center font-rubik-medium text-black-300"
              >
                Search for Your Ideal Home
              </Text>
              <TouchableOpacity className="size-11 bg-primary-200 rounded-full items-center justify-center">
                <Image source={icons.bell} className="size-5"/>
              </TouchableOpacity>
            </View>
            <Search />
            <View className="mt-5">
              <Filters />

              <Text className="text-lg font-rubik-bold mt-5 text-black-300">
                Found {properties?.length} Properties
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
