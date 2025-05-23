import { useLocalSearchParams , router} from "expo-router";
import { Text, View  , Image, TouchableOpacity, FlatList, ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card, FeaturedCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppWrite";
import { getLatestProperties, getProperties } from "@/lib/appwrite";
import { useEffect } from "react";
import NoResults from "@/components/NoResults";

export default function Index() {

  const { user } = useGlobalContext();

  const params = useLocalSearchParams<{query ?: string , filter?:string }>();

  const { data : latestProperties , loading : latestPropertiesLoading } = useAppwrite({
    fn : getLatestProperties
  })

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
    router.push(`/properties/${id}?source=home`);
  }   

  const getGreeting = () => {
    try {
      // Simple approach using local device time directly
      const hours = new Date().getHours();
      
      // Return greeting based on local time
      if (hours >= 5 && hours < 12) {
        return "Good Morning";
      } else if (hours >= 12 && hours < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    } catch (error) {
      console.error("Error getting greeting:", error);
      return "Hello"; // Fallback greeting
    }
  };

  useEffect(()=>{
    refetch({
      filter : params.filter!,
      query : params.query!,
      limit : 6,
    })
  },[params.filter,params.query])

  return (     
    <SafeAreaView className="bg-white h-full">
      <FlatList 
        ListEmptyComponent={loading?(
          <ActivityIndicator size='small' className="text-primary-300 mt-5"/>
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
            <View className="flex flex-row justify-between items-center mt-5">
              <View className="flex-row flex">
                <Image source={{uri : user?.avatar}} className="size-12 rounded-full"/>
                <View className="flex-col flex items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik text-black-100">
                    {getGreeting()}
                  </Text>
                  <Text className="text-base font-rubik-bold text-black-300">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="size-11 bg-primary-200 rounded-full items-center justify-center mt-[1px]">
                <Image source={icons.bell} className="size-5"/>
              </TouchableOpacity>
            </View>

            <Search />

              <View className="my-5">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                  <TouchableOpacity>
                    <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                  </TouchableOpacity>
                </View>

                {latestPropertiesLoading ? 
                  <ActivityIndicator size="small" className="text-primary-300" />
                  : (!latestProperties || latestProperties.length === 0) ? <NoResults /> :
                (
                <FlatList 
                  data={latestProperties || []}
                  renderItem={({item})=><FeaturedCard item={item} onPress={()=>handleCardPress(item.$id)}/>}
                  keyExtractor={(item)=>item.$id} 
                  horizontal 
                  showsHorizontalScrollIndicator = {false}
                  bounces = {false}
                  contentContainerClassName="flex gap-5 mt-5"
                />
                )
                }
              </View>

              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Our Recommendation</Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                </TouchableOpacity>
              </View>

              <Filters />
          </View>
        }
      />
    </SafeAreaView>
  );
}
