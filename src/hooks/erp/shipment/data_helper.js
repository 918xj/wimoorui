import materialApi from '@/api/erp/material/materialApi.js';
import shipmentplanApi from '@/api/erp/ship/shipmentplanApi.js';
import planApi from '@/api/erp/ship/planApi.js';
export function loadInventory(productlist,warehouseid){
	 productlist.forEach(item=>{
	    materialApi.getMaterialInventoryInfo({"sku":item.msku,"warehouseid":warehouseid}).then(res=>{
	     											if(res.data){
														var data=res.data;
														productlist.forEach(skuitem=>{
															if(skuitem.msku==data.material.sku){
																console.log(skuitem);
																if(data.canAssembly){
																	skuitem.canAssembly=data.canAssembly;
																}
																skuitem.fulfillable=data.fulfillable.quantity;
																if(data.pkgDim){
																	skuitem.length=data.pkgDim.length;
																	skuitem.width=data.pkgDim.width;
																	skuitem.height=data.pkgDim.height;
																	skuitem.weight=data.pkgDim.weight;
																}
															}
														})
	     												
	     											}
	    })
	});

}
export function validSkuList(state,skulist){
 				 if(skulist && skulist.indexOf(",")>=0){
 					 shipmentplanApi.guidance({"groupid":state.formData.groupid,
					                           "marketplaceid":state.formData.marketplaceid,
											   "skulist":skulist}).then((res)=>{
 								 var data=res.data;
								 
 								 state.productlist.forEach(function(item){
									 if(data&&data.skUInboundGuidanceList){
										 data.skUInboundGuidanceList.forEach(function(items){
											 if(items.sellerSKU==item.sku){
												item.asin=items.asin;												  item.guidance="error";
											 }
										 })
									 }
 									 if(data&&data.invalidSKUList&&data.invalidSKUList&&data.invalidSKUList.length>0){
 											 data.invalidSKUList.forEach(function(items){
 												 if(items.sellerSKU==item.sku){
 													  item.guidance="error";
 												 }
 											 });
 									 }else if(data == "" || data == null || data == undefined){
 										if(skulist.indexOf(item.sku+",")){
 											item.guidance="warn";
 										}					 
 									 }else{
 										if(skulist.indexOf(item.sku+",")>=0){
 											item.guidance="success";
 										}							 
 									 }
 								 }); 
 					 						 
 					 })
 				 }
 			 }
export 	function submitProductList(state){
 				 let FormDatas = new FormData();
 				 FormDatas.append('file',state.logofile);
 				 FormDatas.append('warehouseid',state.formData.warehouseid);
 				 FormDatas.append('groupid',state.formData.groupid);
 				 FormDatas.append('marketplaceid',state.formData.marketplaceid);
 				 shipmentplanApi.uploadExcel(FormDatas).then((res)=>{
 					 if(res.data && res.data.result && res.data.result.length>0){
 						 downloadVisible.value = false;
 						 state.productlist=[];
 						 ElMessage({
 						    message: '上传成功！',
 						    type: 'success'
 						  })
 						  res.data.result.forEach(function(item){
 							 if(item.msku==undefined || item.msku==null || item.msku==''){
 							 	 item.msku=item.sku;
 							 }
 						 });
 						 state.productlist=res.data.result;
 						 state.totalproducts=state.productlist.length;
 						 var skulist="";
						 loadInventory(state.productlist,state.formData.warehouseid);
 						 if(state.productlist.length>0){
 							 state.productlist.forEach(function(items){
 								 skulist+=(items.sku+",");
 							 }); 
 						 }
 						 if(skulist!=""){
 								validSkuList(state,skulist);
 						 }
 					 }else{
 						 ElMessage({
 						    message: '上传失败！',
 						    type: 'error'
 						  })
 					 }
 				 })
 			 }
			 
export function handleLoadPlanData(state,callback){
	             if(state.queryData.batchnumber){
					 state.productlist=[];
					 state.totalproducts=0;
					 var data={};
					 state.formData.warehouseid=state.queryData.warehouseid;
					 if(state.queryData.marketplaceid=="EU"){
						  data.marketplaceid="EU";
						  state.formData.marketplaceid="A1PA6795UKMFR9";
					 }else{
						  state.formData.marketplaceid=state.queryData.marketplaceid;
						  data.marketplaceid=state.queryData.marketplaceid;
					 }
					 data.batchnumber=state.queryData.batchnumber;
					 data.groupid=state.queryData.groupid;
					 data.warehouseid=state.queryData.warehouseid;
					 state.formData.groupid=state.queryData.groupid;
					 callback(state.queryData);
					 state.formData.warehouseid=state.queryData.warehouseid;
					 planApi.batchList(data).then((res)=>{
					  							 if(res.data && res.data.length>0){
					  								 res.data[0].list.forEach(function(item){
					  									 item.quantity=item.amount;
					  									 item.id=item.id;
					  									 if(item.msku==undefined || item.msku==null || item.msku==''){
					  									 	 item.msku=item.msku;
					  									 }
					  									item.sku=item.sku;
					  								 });
					  								 state.productlist=res.data[0].list;
					  								 state.totalproducts= state.productlist.length;
					  							     loadInventory(state.productlist,state.formData.warehouseid);
					  								 var skulist="";
					  								 if(state.productlist.length>0){
					  										state.productlist.forEach(function(items){
					  											 skulist+=(items.sku+",");
					  										 }); 
					  								 }
					  			   if(skulist!=""){
					  						 validSkuList(state,skulist);
					  			    }
					       }
					 })
				 }
 				 else if(state.queryData.marketplaceid){
 					 //发货规划点过来的
 					 state.productlist=[];
 					 state.totalproducts=0;
 					 var data={};
 					 state.formData.warehouseid=state.queryData.warehouseid;
 					 if(state.queryData.marketplaceid=="EU"){
					    state.formData.marketplaceid="A1PA6795UKMFR9";
					 }else{
					    state.formData.marketplaceid=state.queryData.marketplaceid;
 					 }
 					 data.planid=state.queryData.planid;
 					 data.issplit=state.queryData.issplit;
 					 if(!data.issplit&&state.queryData.marketplaceid=="A1PA6795UKMFR9"){
 					 	  data.marketplaceid="EU";
 					 }else{
 						  data.marketplaceid=state.queryData.marketplaceid;
 					 }
					 if(!data.issplit){
						 data.issplit="false";
					 }
 					 data.groupid=state.queryData.groupid;
 					 state.formData.groupid=state.queryData.groupid;
					 state.formData.warehouseid=state.queryData.warehouseid;
					 callback(state.queryData);
 					 data.warehouseid=state.queryData.warehouseid;
 					 shipmentplanApi.findPlanSubDetail(data).then((res)=>{
 							 if(res.data && res.data.length>0){
 								 res.data.forEach(function(item){
 									 item.quantity=item.amount;
 									 item.id=item.materialid;
 									 if(item.msku==undefined || item.msku==null || item.msku==''){
 									 	 item.msku=item.sku;
 									 }
 									item.sku=item.psku;
 								 });
 								 state.productlist=res.data;
 								 state.totalproducts=state.productlist.length;
								 loadInventory(state.productlist,state.formData.warehouseid);
 								 var skulist="";
 								 if(state.productlist.length>0){
 										state.productlist.forEach(function(items){
 											 skulist+=(items.sku+",");
 										 }); 
 								 }
 								 if(skulist!=""){
 										validSkuList(state,skulist);
 								 }
 							 }
 					 })
 				 }
 				 else if(state.queryData.shipmentid){
 					 //货件审核的时候 复制按钮 点进来的
 					 state.productlist=[];
 					 state.totalproducts=0;
 					 shipmentplanApi.getItemlistByShipmentId({"shipmentid":state.queryData.shipmentid}).then((res)=>{
 						 if(res.data){
 							 var data=res.data;
 							 state.formData.groupid=data.groupid;
 							 state.formData.marketplaceid=data.marketplaceid;
 							 state.formData.warehouseid=data.warehouseid;
							 callback(data);
 							 if(data.itemlist && data.itemlist.length>0){
 								 data.itemlist.forEach(function(item){
 									 item.sku=item.SellerSKU;
 									 item.quantity=item.Quantity;
 									 item.fulfillable=item.invquantity;
 									 item.id=item.mid;
 									 if(item.msku==undefined || item.msku==null || item.msku==''){
 										 item.msku=item.SellerSKU;
 									 }
 									 
 								 });
 								state.productlist=data.itemlist;
 								state.totalproducts=state.productlist.length;
								loadInventory(state.productlist,state.formData.warehouseid);
 								var skulist="";
 								if(state.productlist.length>0){
 									 state.productlist.forEach(function(items){
 										 skulist+=(items.sku+",");
 									 }); 
 								}
 								if(skulist!=""){
 									 validSkuList(state,skulist);
 								}
 							 }
 						 }
 					 });
 				 }
				 
 			 }